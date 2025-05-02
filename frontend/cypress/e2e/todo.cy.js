describe('Task Detail functionality', () => {
    let uid, taskid, name, email;
  
    before(() => {
      // Create a new user for the test
      cy.fixture('user.json').then((user) => {
        email = user.email;
        name = user.firstName + ' ' + user.lastName;
  
        cy.request({
          method: 'POST',
          url: 'http://localhost:5000/users/create',
          form: true,
          body: user
        }).then((response) => {
          uid = response.body._id.$oid;
  
          // Log in the user
          cy.visit('http://localhost:3000');
          cy.get('.inputwrapper #email').type(email);
          cy.get('form').submit();
  
          // Assert that the user is logged in
          cy.contains('h1', 'Your tasks, ' + name).should('be.visible');
  
          // Create a task for this user
          cy.request({
            method: 'POST',
            url: 'http://localhost:5000/tasks/create',
            form: true,
            body: {
              title: 'Test Task',
              description: '',
              userid: uid,
              url: 'dQw4w9WgXcQ'
            }
          }).then((response) => {
            taskid = response.body._id.$oid;
          });
        });
      });
    });
  
    // Test case 1: R8UC1T1 - Button should be disabled if description is empty
    // Need to empty description field since default is not empty.
    it('should disable add button if description is empty', () => {
      cy.visit(`http://localhost:3000/task/${taskid}`);
      cy.get('button[type="submit"]').should('be.disabled');
    });
  
    // Test case 2: R8UCT2 - Adding a new todo
    it('should add a new todo item when description is entered and add button clicked', () => {
      cy.visit(`http://localhost:3000/task/${taskid}`);
      cy.get('input[type="text"]').type('New Todo Description');
      cy.get('button[type="submit"]').click();
  
      // Assert that the new todo appears at the bottom of the list
      cy.get('.todo-item').last().should('contain.text', 'New Todo Description');
    });
  
    // Test case 3: R8UC2T1 - Mark todo as done
    it('should mark todo as done when clicked', () => {
      cy.visit(`http://localhost:3000/task/${taskid}`);
      cy.get('.todo-item .checker').first().click();
  
      // Assert that the first todo item is struck through (done)
      cy.get('.todo-item').first().should('have.class', 'checked');
    });
  
    // Test case 4: R8UC2T2 - Mark done todo as active
    it('should mark done todo as active when clicked', () => {
      cy.visit(`http://localhost:3000/task/${taskid}`);
      cy.get('.todo-item .checker').first().click(); // Uncheck to make it active
  
      // Assert that the first todo item is no longer struck through (active)
      cy.get('.todo-item').first().should('not.have.class', 'checked');
    });
  
    // Test case 5: R8UC3T1 - Remove a todo item
    it('should remove todo item when x icon clicked', () => {
      cy.visit(`http://localhost:3000/task/${taskid}`);
      cy.get('.todo-item .remover').first().click();
  
      // Assert that the todo item is removed from the list
      cy.get('.todo-item').should('not.contain.text', 'New Todo Description');
    });
  
    after(() => {
      // Clean up: delete the user and task created for testing
      cy.request({
        method: 'DELETE',
        url: `http://localhost:5000/users/${uid}`
      });
  
      cy.request({
        method: 'DELETE',
        url: `http://localhost:5000/tasks/${taskid}`
      });
    });
  });
  