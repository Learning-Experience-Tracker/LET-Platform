/* Mock up for platform access control list, it should be more intelligent */

module.exports.adminOnly = function(req, res, next){
    if(req.user.role != 'admin'){
        res.status(403).end();
        return;
    }

    next();
}

module.exports.studentOnly = function(req, res, next){
    if(req.user.role != 'student'){
        res.status(403).end();
        return;
    }

    next();
}

module.exports.teacherOnly = function(req, res, next){
    if(req.user.role != 'teacher'){
        res.status(403).end();
        return;
    }

    next();
}