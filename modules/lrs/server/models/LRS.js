module.exports = function(mongoose){
    let LRSSchema = new mongoose.Schema({
        name : String,
        userId : String,
        username : String,
        password : String
    });

    return {
        model : mongoose.model('LRS', LRSSchema),
        name : 'LRS'
    };
}

