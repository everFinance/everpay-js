import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import strip from "@rollup/plugin-strip";
import typescript from "@rollup/plugin-typescript";
import path from "path";
// import externals from "rollup-plugin-node-externals";
import { terser } from "rollup-plugin-terser"
import json from '@rollup/plugin-json'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'
// import builtins from 'rollup-plugin-node-builtins';

// import pkg from "./package.json"  assert { type: 'json' };

export default [
  {
    input: "./src/index.ts", // 入口文件
    output: [ 
      {
        name: 'Everpay', //浏览器引入的全局变量名称
        file: 'umd/index.umd.js', //输出文件
        format: 'umd', //输出格式
        exports: 'named', //导出的是全局变量命名方式
        plugins: [
          terser() //terser插件在rollup打包过程当中实现代码压缩
        ],
      },
    ],
    plugins: [
      // 自动将dependencies依赖声明为 externals
      // externals({
      //   devDeps: false,
      // }),
      // 处理外部依赖
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      json(),
      // 支持基于 CommonJS 模块引入
      commonjs({}),
      // 支持 typescript，并导出声明文件
      typescript({
      }),
      // 清除调试代码
      strip(),
      rollupNodePolyFill({ include: null }),
    ],
  },
]