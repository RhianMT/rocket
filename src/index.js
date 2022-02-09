const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const { json } = require('express');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const customer = users.find((customer) => customer.username === username);

  if (!customer) {
    return response.status(400).json({ error: 'username not found' })
  }

  request.customer = customer;

  next();

}

app.post('/users', (request, response) => {

  const { name, username } = request.body;

  const alreadyUsernameExists = users.find((users) => users.username === username);

  if (alreadyUsernameExists) {
    return response.json({ error: "already username exists" });
  }

  users.push({
    name,
    username,
    uuid: uuidv4(),
    todos: []
  })

  console.log(users);
  return response.status(201).send();

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { customer } = request;
  response.status(201).json(customer.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.header;
  const { customer } = request;

  const { title, deadline } = request.body;

  const todosOperation = {
    uuid: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: new Date()
  }

  customer.todos.push(todosOperation);


  //console.log(todosOperation);
  return response.status(201).send();


});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { customer } = request;

  const customerFind = customer.todos.find(customerFind => customerFind.uuid === id);

  if (customerFind) {
    customerFind.title = title;
    customerFind.deadline = deadline;
    return response.status(201).json(customer.todos)
  } else {
    return response.status(401).json(`this todos not belongs you`);
  }


});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { done } = request.body;
  const { customer } = request;

  const customerFind = customer.todos.find(customerFind => customerFind.uuid === id);
  //    customerFind irá se tornar customer.todos.find, após, será feita uma busca de uuid pra comparar com id

  if (customerFind) {
    customerFind.done = done;
    return response.status(201).json(`already done`)
  }

  return response.status(401).json(`oops, somenthing went error`)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { customer } = request;

  const customerFind = customer.todos.find(customerFind => customerFind.uuid === id)

  if (customerFind) {
    customer.todos.splice(customerFind, 1)
    return response.status(201).json(`ok, todos were deleted`)
  } else {
    return response.status(401).json(`this todos not belongs you`);
  }


});

module.exports = app;