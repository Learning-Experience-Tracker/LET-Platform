define({ "api": [
  {
    "type": "post",
    "url": "/api/activity/create",
    "title": "Create activity",
    "name": "Create_activity",
    "group": "Activities",
    "description": "<p>This method will be used for send xapi statements to our platform.</p>",
    "permission": [
      {
        "name": "admin"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Json",
            "optional": false,
            "field": "statement",
            "description": "<p>xapi statement</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Statement-Parameter-Example:",
          "content": "{\n    \"stored\": \"2017-06-28T08:16:12.800000-05:00\", \n    \"version\": \"1.0.1\", \n    \"verb\": {\n        \"id\": \"https://w3id.org/xapi/adl/verbs/completed\", \n        \"display\": {\n            \"en-US\": \"completed\"\n        }\n    }, \n    \"authority\": {\n        \"mbox\": \"mailto:admin@myschool.edu\", \n        \"objectType\": \"Agent\"\n    }, \n    \"timestamp\": \"2017-06-28T08:16:12.800000-05:00\", \n    \"object\": {\n        \"definition\": {\n            \"name\": {\n                \"en-US\": \"final\"\n            }\n        }, \n        \"id\": \"http://myschool.edu/xapi/cop-3223/final\"\n    }, \n    \"id\": \"cf8578e7-4c91-43c1-84c0-f29f984542fa\", \n    \"actor\": {\n        \"mbox\": \"mailto:sherley.pressley@myschool.edu\", \n        \"name\": \"Sherley Pressley\"\n    }, \n    \"result\": {\n        \"score\": {\n            \"raw\": 82, \n            \"max\": 100, \n            \"min\": 0\n        }, \n        \"success\": \"true\"\n    }\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Ok.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"firstname\": \"John\",\n  \"lastname\": \"Doe\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "UserNotFound",
            "description": "<p>The id of the User was not found.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found\n{\n  \"error\": \"UserNotFound\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "apidoc_source/activities-group.js",
    "groupTitle": "Activities"
  },
  {
    "type": "get",
    "url": "/api/activity/:id",
    "title": "Get activity",
    "name": "Get_activity",
    "group": "Activities",
    "version": "0.0.0",
    "filename": "apidoc_source/activities-group.js",
    "groupTitle": "Activities"
  },
  {
    "type": "get",
    "url": "/api/activity/all",
    "title": "Get all activities",
    "name": "Get_all_activities",
    "group": "Activities",
    "version": "0.0.0",
    "filename": "apidoc_source/activities-group.js",
    "groupTitle": "Activities"
  },
  {
    "type": "post",
    "url": "/api/assessment/create",
    "title": "Create assessment",
    "name": "Create_assessment",
    "group": "Assessments",
    "version": "0.0.0",
    "filename": "apidoc_source/assessment-group.js",
    "groupTitle": "Assessments"
  },
  {
    "type": "post",
    "url": "/api/assessment/delete",
    "title": "Delete assessment",
    "name": "Delete_assessment",
    "group": "Assessments",
    "version": "0.0.0",
    "filename": "apidoc_source/assessment-group.js",
    "groupTitle": "Assessments"
  },
  {
    "type": "get",
    "url": "/api/assessment/all",
    "title": "Get all assessment",
    "name": "Get_all_activities",
    "group": "Assessments",
    "version": "0.0.0",
    "filename": "apidoc_source/assessment-group.js",
    "groupTitle": "Assessments"
  },
  {
    "type": "post",
    "url": "/api/assessment/questions/all",
    "title": "Get all questions",
    "name": "Get_all_questions",
    "group": "Assessments",
    "version": "0.0.0",
    "filename": "apidoc_source/assessment-group.js",
    "groupTitle": "Assessments"
  },
  {
    "type": "get",
    "url": "/api/assessment/:id",
    "title": "Get assessment",
    "name": "Get_assessment",
    "group": "Assessments",
    "version": "0.0.0",
    "filename": "apidoc_source/assessment-group.js",
    "groupTitle": "Assessments"
  },
  {
    "type": "post",
    "url": "/api/assessment/:id/questions",
    "title": "Get assessments questions",
    "name": "Get_assessments_questions",
    "group": "Assessments",
    "version": "0.0.0",
    "filename": "apidoc_source/assessment-group.js",
    "groupTitle": "Assessments"
  },
  {
    "type": "post",
    "url": "/api/course/create",
    "title": "Create course",
    "name": "Create_course",
    "group": "Courses",
    "version": "0.0.0",
    "filename": "apidoc_source/course-group.js",
    "groupTitle": "Courses"
  },
  {
    "type": "post",
    "url": "/api/course/delete",
    "title": "Delete course",
    "name": "Delete_course",
    "group": "Courses",
    "version": "0.0.0",
    "filename": "apidoc_source/course-group.js",
    "groupTitle": "Courses"
  },
  {
    "type": "get",
    "url": "/api/course/all",
    "title": "Get all courses",
    "name": "Get_all_courses",
    "group": "Courses",
    "version": "0.0.0",
    "filename": "apidoc_source/course-group.js",
    "groupTitle": "Courses"
  },
  {
    "type": "get",
    "url": "/api/course/:id",
    "title": "Get course",
    "name": "Get_course",
    "group": "Courses",
    "version": "0.0.0",
    "filename": "apidoc_source/course-group.js",
    "groupTitle": "Courses"
  },
  {
    "type": "post",
    "url": "/api/resource/create",
    "title": "Create resource",
    "name": "Create_resource",
    "group": "Resources",
    "version": "0.0.0",
    "filename": "apidoc_source/resource-group.js",
    "groupTitle": "Resources"
  },
  {
    "type": "post",
    "url": "/api/resource/delete",
    "title": "Delete resource",
    "name": "Delete_resource",
    "group": "Resources",
    "version": "0.0.0",
    "filename": "apidoc_source/resource-group.js",
    "groupTitle": "Resources"
  },
  {
    "type": "get",
    "url": "/api/resource/all",
    "title": "Get all resource",
    "name": "Get_all_activities",
    "group": "Resources",
    "version": "0.0.0",
    "filename": "apidoc_source/resource-group.js",
    "groupTitle": "Resources"
  },
  {
    "type": "get",
    "url": "/api/resource/:id",
    "title": "Get resource",
    "name": "Get_resource",
    "group": "Resources",
    "version": "0.0.0",
    "filename": "apidoc_source/resource-group.js",
    "groupTitle": "Resources"
  },
  {
    "type": "get",
    "url": "/api/resource/types",
    "title": "Get resources types",
    "name": "Get_resources_types",
    "group": "Resources",
    "version": "0.0.0",
    "filename": "apidoc_source/resource-group.js",
    "groupTitle": "Resources"
  },
  {
    "type": "get",
    "url": "/api/user/create",
    "title": "Create user",
    "name": "Create_user",
    "group": "Users",
    "version": "0.0.0",
    "filename": "apidoc_source/user-group.js",
    "groupTitle": "Users"
  }
] });
