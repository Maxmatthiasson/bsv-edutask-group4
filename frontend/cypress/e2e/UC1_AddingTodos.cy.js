describe('UC1 - Adding Todos', () => {
  let uid;
  let taskId;
  let user;
  let name;

  // Create test user before any tests
  before(() => {
    cy.fixture('user.json').then((userData) => {
      user = userData;
      name = `${user.firstName} ${user.lastName}`;

      cy.request('POST', 'http://localhost:5000/users/create', user).then((res) => {
        uid = res.body._id.$oid;
      });
    });
  });

  // Create a new task before each test
  beforeEach(() => {
    cy.then(() => {
      return cy.request('POST', 'http://localhost:5000/tasks/create', {
        title: 'Add Todo Test Task',
        url: 'video_uc1',
        userid: uid,
        todos: [],
      }).then((res) => {
        taskId = res.body.$oid;
      });
    });
  });

  it('R8UC1T1 - should NOT add a todo item when description is empty', () => {
    cy.visit(`/task/${taskId}`);

    cy.get('input[placeholder="Add a new todo item"]').clear(); // Empties description field.
    cy.get('input[type="submit"][value="Add"]').click();

    // Checks that no todo item was added.
    cy.get('.todo-list .todo-item').should('have.length', 0);
  });

  it('R8UC1T2 - should append new todo item in task detail view', () => {
    cy.visit(`/task/${taskId}`);

    const newTodo = 'Learn frontend testing';
    cy.get('input[placeholder="Add a new todo item"]').type(newTodo);
    cy.get('input[type="submit"][value="Add"]').click();

    // Verify the new todo appears
    cy.get('.todo-list .todo-item').should('have.length', 1);
    cy.get('.todo-list .todo-item').first().should('contain.text', newTodo);
  });

  after(() => {
    if (uid) {
      cy.request('DELETE', `http://localhost:5000/users/${uid}`);
    }
  });
});
