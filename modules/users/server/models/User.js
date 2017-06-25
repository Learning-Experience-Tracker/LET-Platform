module.exports = function(mongoose){
    let UserSchema = new mongoose.Schema({
        name : String,
        username : String,
        password : String
    });

    UserSchema.methods.authenticate = function(password){
        return password == this.password;
    }

    return {
        model : mongoose.model('User', UserSchema),
        name : 'User'
    };
}

