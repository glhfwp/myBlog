# 打包，根据名称和要打包的路由修改
rm -rf build/*
npm run build
mkdirArr=("page1" "page2" "page3")
for item in ${mkdirArr[@]}; do
  mkdir build/$item
  cp build/index.html build/$item
done
# 再做发布的shell脚本
