const mongoose = require('mongoose');
// 设置不要使用useFindAndModify驱动以实现findByIdAndUpdate功能
mongoose.set('useFindAndModify', false)
mongoose.connect('mongodb://localhost/playground', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('成功')
    })
    .catch(err => {
        console.log('失败');
    })