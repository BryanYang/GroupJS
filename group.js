var fs = require('fs');
var path = require('path');
var async = require('async');


var YearTag = '年';
var MonthTag = '月';
var groupFun = undefined;


/*
 * 目录对应的文件格式列表
 * 当根据文件类型来组织目录时，
 * 会根据这个表将文件放到对应目录
 * 如果新文件格式，表中没有，将放到others，
 * 可添加或者修改新的对应关系。
 */
var suf_Dir = {
    'Excel文档': ['xls', 'xlsx'],
    'Excel文档': ['xls', 'xlsx'],
    'Word文档': ['doc', 'docx'],
    '应用程序包': ['dmg', 'exe', 'apk', 'msi'],
    '压缩文件': ['rar', 'tar', 'zip', 'gzip'],
    '静态图片': ['jpg', 'png'],
    '动态图片': ['gif'],
    'PDF 文档': ['pdf'],
    'Axure文件': ['rp'],
    '网页相关': ['html', 'js', 'css'],
    'PPT 文档': ['pptx', 'ppt']
}


start();

function start() {
    if (process.argv.length == 2) {
        groupFun = g_type;
    } else if (process.argv.length == 3) {
        if (process.argv[2] == '-m') {
            groupFun = g_month;
        } else if (process.argv[2] == '-t') {
            groupFun = g_type;
        } else if (process.argv[2] == '-pdf') {
            groupFun = g_pdf;
        } else if (process.argv[2] == '--help') {
            console.log('Help:');
            console.log('    -m, group by month (Default)');
            console.log('    -t, group by file type');
        }

    }

    if (groupFun) {
        async.waterfall([
            function(cb) {
                fs.readdir(process.cwd(), function(err, _files) {
                    cb(null, _files);
                })
            },
            function(_files, cb) {
                getStat(_files, cb);
            },
            function(files, stats, cb) {
                //console.log(files);
                groupFun(files, stats, cb);
            },
            function(files, cb) {
                async.each(files, moveFile, function(err) {
                    if (err) {
                        console.log(err)
                    }

                })
            }
        ])
    }

}

function getStat(_files, cb) {
    async.map(_files, fs.stat, function(err, results) {
        cb(null, _files, results);
    });
}


//group by month
function g_month(files, _stats, cb) {
    var f_month = [];
    for (var i = 0; i < _stats.length; i++) {
        f_month.push('20' + (_stats[i].ctime.getYear() - 100) + YearTag + (_stats[i].ctime.getMonth() + 1) + MonthTag);
    }

    async.each(f_month, function(_f, callback) {
        var p = path.join(__dirname, _f);
        fs.exists(p, function(exists) {
            if (!exists) {
                fs.mkdir(p, function() {
                    console.log('mkdir--' + p);
                    callback();
                })
            } else {
                callback();
            }
        })

    }, function(err) {
        if (err) {
            console.log(err);
        } else {
            var tmp = [];
            for (var i = 0; i < files.length; i++) {
                var n = files[i];
                var p = path.join(__dirname, f_month[i]);
                tmp.push({
                    name: n,
                    path: p
                })
            }
            cb(null, tmp);
        }
    })
}

//move all the pdf file to path.
function g_pdf(files, _stats, cb) {
    var pdfs = files.filter(function(f) {
        return f.isType('pdf')
    });
    cb(null, pdfs);
}

function g_type(files, _stats, cb) {
    async.each(_keys(suf_Dir).concat(['其它', '文件夹']), function(d, callback) {
            fs.exists(d, function(exists) {
                if (!exists) {
                    fs.mkdir(d, function() {
                        console.log('mkdir--' + d);
                        callback();
                    })
                } else {
                    callback();
                }
            })
        },
        function(err) {
            if (err) {
                console.log(err);
            }
            cb(err, files);
        })
}

function moveFile(file, cb) {
    if (file.name === 'group.js') {
        cb();
    } else if (/^\d+年\d+月$/.test(file.name)) {
        cb();
    } else if (process.argv[2] == '-m') {
        fs.rename(path.join(__dirname, file.name), file.path + '/' + file.name, function(err) {
            cb(err);
        })
    } else if (process.argv[2] == '-pdf') {
        fs.rename(path.join(__dirname, file), '/Users/yangbryan/Documents/Book/' + file, function(err) {
            cb(err);
        })
    } else if (process.argv[2] == '-t') {
        moveTypeDir(file, cb);
    }
}

function moveTypeDir(file, cb) {
    //如果文件是类型目录文件跳过
    if (_keys(suf_Dir).concat(['其它', '文件夹']).indexOf(file) >= 0) {
        cb();
    } else {
        fs.rename(path.join(__dirname, file), path.join(__dirname, _getTypeDir(file), file), function(err) {
            cb(err);
        })
    }
}

String.prototype.isType = function(t) {
    var ss = this.split('.');
    var _t = ss[ss.length - 1];
    return _t == t;
}

var _getTypeDir = function(file) {
    var stat = fs.lstatSync(file);
    var dir = '其它';
    if (stat.isDirectory()) {
        dir = '文件夹';
    } else {
        var suf = file.suf();
        for (d in suf_Dir) {
            if (suf_Dir[d].indexOf(suf) >= 0) {
                dir = d;
            }
        }
    }

    return dir;
}

String.prototype.suf = function() {
    var ss = this.split('.');
    return (ss[ss.length - 1]).toLowerCase();
}

var _keys = function(obj) {
    var array = [];
    for (i in obj) {
        if (obj.hasOwnProperty(i)) {
            array.push(i);
        }
    }
    return array;
}