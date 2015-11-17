# GroupJS
归类你的目录。使你的工作目录更加清爽~


## Overview
#如何使用

1.安装 [nodejs](https://nodejs.org/en/) ,安装完成后，**Terminal** 运行`node -v`如果出现版本号，则成功安装。
```
node -v
v[版本号]
```

2.安装工具依赖包 async.js, **Terminal** 中 **sudo**运行
```
npm install -g async
```
如果是mac系统，安装完成后请运行下面命令，设置环境变量：
```
export NODE_PATH=/usr/local/lib/node_modules
```
3.将项目中的 *group.js* 复制到你想归类的目录下，比如万信的下载目录为
> /Users/[用户目录]/Library/Application Support/万达集团/万信/216263/DownFiles

4.**Terminal** 运行
```
cd /Users/[用户目录]/Library/Application Support/万达集团/万信/216263/DownFiles
```
```
node group
```
成功运行后，你的目录结构应该为：
* 动态图片
* 静态图片
* 其它
* 网页相关
* 文件夹
* 压缩文件
* 应用程序包
