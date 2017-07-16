/**
     * @api {post} /api/activity/create Create activity
     * @apiName Create activity
     * @apiGroup Activities
     * 
     * @apiDescription This method will be used for send xapi statements to our platform.
     *
     * @apiPermission admin
     * 
     * @apiParam {Json} statement xapi statement
     * @apiParamExample {json} Statement-Parameter-Example:
                {
                    "stored": "2017-06-28T08:16:12.800000-05:00", 
                    "version": "1.0.1", 
                    "verb": {
                        "id": "https://w3id.org/xapi/adl/verbs/completed", 
                        "display": {
                            "en-US": "completed"
                        }
                    }, 
                    "authority": {
                        "mbox": "mailto:admin@myschool.edu", 
                        "objectType": "Agent"
                    }, 
                    "timestamp": "2017-06-28T08:16:12.800000-05:00", 
                    "object": {
                        "definition": {
                            "name": {
                                "en-US": "final"
                            }
                        }, 
                        "id": "http://myschool.edu/xapi/cop-3223/final"
                    }, 
                    "id": "cf8578e7-4c91-43c1-84c0-f29f984542fa", 
                    "actor": {
                        "mbox": "mailto:sherley.pressley@myschool.edu", 
                        "name": "Sherley Pressley"
                    }, 
                    "result": {
                        "score": {
                            "raw": 82, 
                            "max": 100, 
                            "min": 0
                        }, 
                        "success": "true"
                    }
                }
     * @apiSuccess {String} Ok.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "firstname": "John",
     *       "lastname": "Doe"
     *     }
     *
     * @apiError UserNotFound The id of the User was not found.
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       "error": "UserNotFound"
     *     }
     * @apiVersion 1.0.0
     */

/**
    * @api {get} /api/activity/all Get all activities
    * @apiName Get all activities
    * @apiGroup Activities
    */

/**
    * @api {get} /api/activity/:id Get activity
    * @apiName Get activity
    * @apiGroup Activities
    */