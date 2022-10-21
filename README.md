<!--
 * @description: 
 * @Author: 赵志伟
 * @Date: 2022-09-23 14:41:55
-->
利用node 打包压缩转换html,css,将es6转es5等

1. 根目录设置模板文件：
    - template
        - html
        - css
        - js

2. 在package.json配置命令 如："build-tmp" : "build-tmp"

3. 根目录输出文件：
    - tmp
        - html
        - css
        - js

4. 压缩命令如：yarn build-tmp
5. css、js 分别统一成一个文件

