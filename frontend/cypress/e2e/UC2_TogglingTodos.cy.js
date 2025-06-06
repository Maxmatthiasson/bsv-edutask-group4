describe('UC2 - Toggling Todo Done Status', () => {
  let uid;
  let taskId;
  let todoId;
  let user;

  // Create a test user before all tests
  before(() => {
    cy.fixture('user.json').then((userData) => {
      user = userData;

      cy.request('POST', 'http://localhost:5000/users/create', user).then((res) => {
        uid = res.body._id.$oid;
      });
    });
  });

  // Create a new task with one todo before each test
  beforeEach(() => {
    cy.then(() => {
      return cy.request('POST', 'http://localhost:5000/tasks/create', {
        title: 'Toggle Test Task',
        url: 'video_uc2',
        userid: uid,
        todos: ['Sample todo'],
      }).then((taskRes) => {
        taskId = taskRes.body.$oid;

        // Fetch the task to get the todo ID
        return cy.request(`http://localhost:5000/tasks/${taskId}`).then((res) => {
          todoId = res.body.todos[0]._id.$oid;
        });
      });
    });
  });

  it('R8UC2T1 - should mark a todo as done (struck through)', () => {
    cy.visit(`/task/${taskId}`);

    // Clicks to mark the todo item as done.
    cy.get(`[data-todo-id="${todoId}"] .checker`).click();

    // Expects a line through the text.
    cy.get(`[data-todo-id="${todoId}"] .editable`)
      .should('have.css', 'text-decoration')
      .and('include', 'line-through');
  });

  it('R8UC2T2 - should unmark a done todo (remove strikethrough)', () => {
    // Sets the todo as done via the backend.
    cy.then(() => {
      return cy.request('PUT', `http://localhost:5000/todos/${todoId}`, {
        done: true,
      });
    });

    cy.visit(`/task/${taskId}`);

    // Clicks to unmark as done.
    cy.get(`[data-todo-id="${todoId}"] .checker`).click();

    // Expects that the text does not have a line through it.
    cy.get(`[data-todo-id="${todoId}"] .editable`)
      .should('have.css', 'text-decoration')
      .and('not.include', 'line-through');
  });

  after(() => {
    if (uid) {
      cy.request('DELETE', `http://localhost:5000/users/${uid}`);
    }
  });
});
