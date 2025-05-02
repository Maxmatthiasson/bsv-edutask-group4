describe('Task Detail functionality', () => {
    let uid, name, email;
  
    before(() => {
      // Create test user via API
      cy.fixture('user.json').then((user) => {
        email = user.email;
        name = `${user.firstName} ${user.lastName}`;
  
        cy.request({
          method: 'POST',
          url: 'http://localhost:5000/users/create',
          form: true,
          body: user
        }).then((response) => {
          uid = response.body._id.$oid;
        });
      });
    });
  
    it('R8UCT2 - should append new todo item in task detail view', () => {
      // Step 1: Log in via UI
      cy.visit('http://localhost:3000');
      cy.get('input#email').type(email);
      cy.get('form').submit();
  
      // Confirm login success
      cy.contains('Your tasks,').should('contain.text', name);
  
      // Step 2: Create a task using TaskCreator component
      cy.get('input#title').type('Test Task');
      cy.get('input#url').type('dQw4w9WgXcQ');
      cy.contains('Create new Task').click();
  
      // Wait for task to be visible
      cy.get(`img[src*="dQw4w9WgXcQ"]`, { timeout: 5000 }).should('be.visible');
  
      // Step 3: Click the task to open detail view
      cy.get(`img[src*="dQw4w9WgXcQ"]`).click();
  
      // Step 4: Add a new todo item
      const newTodo = 'New Todo Description';
      cy.get('input[placeholder="Add a new todo item"]').type(newTodo);
      cy.get('input[type="submit"][value="Add"]').click();
  
      // Step 5: Confirm new todo is added to bottom
      cy.get('.todo-list .todo-item').last().should('contain.text', newTodo);
    });
  
    after(() => {
      // Cleanup: delete the test user
      if (uid) {
        cy.request('DELETE', `http://localhost:5000/users/${uid}`);
      }
    });
  });
  