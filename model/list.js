  const mongoose = require('mongoose');
  // 创建集合规则
  const PipilistSchema = new mongoose.Schema({
      content: String
  });
  // 创建集合
  const Pipipi = mongoose.model('Pipipi', PipilistSchema);
  module.exports = {
      Pipipi
  }

  //   创建数据
  //   const article = new Pipipi({
  //       content: "<p>这是我写的第一个网站，因为没什么经验所以也比较简陋，没有绚丽的功能，主要用来记录自己的一些学习经历和学习总结的笔记还有自己的一些想法吧。作为第一个练手的个人网站，我采用的是Vue框架，Vuex，VueRouter，和ElementUi组件库，同时也引入了富文本编辑器实现了简单的增删改查功能，后台的搭建用的是Node.js，express和mongoDB作为数据来源。希望自己能够不断进步！</p>"
  //   });
  //   保存数据
  //   article.save()