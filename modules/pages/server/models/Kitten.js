module.exports = function(mongoose){
    let KittenSchema = new mongoose.Schema({
        name : String
    });

    KittenSchema.methods.speak = function(){
        return 'My name is ' + this.name;
    }

    return {
        model : mongoose.model('Kitten', KittenSchema),
        name : 'Kitten'
    };
}

