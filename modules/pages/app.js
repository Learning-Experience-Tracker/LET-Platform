'use strict';

var express = require('express'),
    pagesCtr = require('./server/controllers/PagesController');

module.exports = function(app){

    app.route('/*').get(pagesCtr.renderIndexPage);
    
}