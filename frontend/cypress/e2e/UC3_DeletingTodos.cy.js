describe('UC3 - Deleting Todo Items', () => {
  let uid;
  let taskId;
  let todoId;
  const todoText = 'Todo to delete';

  // Create test user
  before(() => {
    cy.fixture('user.json').then((userData) => {
      cy.request('POST', 'http://localhost:5000/users/create', userData).then((res) => {
        uid = res.body._id.$oid;
      });
    });
  });

  // Create a task with one todo before each test
  beforeEach(() => {
    cy.then(() => {
      return cy.request('POST', 'http://localhost:5000/tasks/create', {
        title: 'Delete Test Task',
        url: 'video_uc3',
        userid: uid,
        todos: [todoText],
      }).then((taskRes) => {
        taskId = taskRes.body.$oid;

        return cy.request(`http://localhost:5000/tasks/${taskId}`).then((res) => {
          todoId = res.body.todos[0]._id.$oid;
        });
      });
    });
  });

  it('R8UC3T1 - should remove a todo item from the list with one click', () => {
    cy.visit(`/task/${taskId}`);

    // Click the delete button once instead of twice.
    cy.get(`[data-todo-id="${todoId}"] .remover`).click();

    // Verifies that the todo is delteted. Currently does not work as expected and fails.
    cy.get(`[data-todo-id="${todoId}"]`).should('not.exist');
  });

  after(() => {
    if (uid) {
      cy.request('DELETE', `http://localhost:5000/users/${uid}`);
    }
  });
});
