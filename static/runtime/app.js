module.exports = {

  mode: 'development',

  proxy: {
    '/api/*': 'http://localhost:3500/test/*'
  },

  collections: {
    "todo": {
      "name" : "todo",
      "type" : "DemoToDo"
    }
  },
  defaultPage: "todolist",
};
