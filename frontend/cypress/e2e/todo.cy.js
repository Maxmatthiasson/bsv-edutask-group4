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

    // Should fail since add button does not become disabled when the description is empty.
    it('R8UC1T1 - should NOT add a todo item when description is empty', () => {
      cy.visit('http://localhost:3000');
      cy.get('input#email').type(email);
      cy.get('form').submit();

      cy.contains('Your tasks,').should('contain.text', name);

      cy.get('input#title').type('Task for R8UC1T1');
      cy.get('input#url').type('testvideo');
      cy.contains('Create new Task').click();

      // Clicks on the add button that is supposed to be disabled.
      cy.get('.container-element img[src*="testvideo"]', { timeout: 5000 }).first().click();

      cy.get('.todo-list .todo-item').then((itemsBefore) => {
        const initialCount = itemsBefore.length;

        cy.get('input[placeholder="Add a new todo item"]').clear({ force: true });

        cy.get('input[type="submit"][value="Add"]').click({ force: true });

        cy.wait(500);
        cy.get('.todo-list .todo-item').then((itemsAfter) => {
          const finalCount = itemsAfter.length;

          // The number of items should NOT have increased
          expect(finalCount).to.equal(initialCount);
        });
      });
    });

    it('R8UCT2 - should append new todo item in task detail view', () => {
      cy.visit('http://localhost:3000');
      cy.get('input#email').type(email);
      cy.get('form').submit();
  
      cy.contains('Your tasks,').should('contain.text', name);
  
      cy.get('input#title').type('Test Task');
      cy.get('input#url').type('dQw4w9WgXcQ');
      cy.contains('Create new Task').click();
  
      cy.get(`img[src*="dQw4w9WgXcQ"]`, { timeout: 5000 }).should('be.visible');
  
      cy.get('.container-element img[src*="dQw4w9WgXcQ"]').first().should('be.visible').click();
  
      const newTodo = 'New Todo Description';
      cy.get('input[placeholder="Add a new todo item"]').type(newTodo, { force: true });
      cy.get('input[type="submit"][value="Add"]').click({ force: true });
  
      cy.get('.todo-list .todo-item').last().should('contain.text', newTodo);
    });

    it('R8UC2T1 - should mark a todo as done (struck through)', () => {
      cy.visit('http://localhost:3000');
      cy.get('input#email').type(email);
      cy.get('form').submit();

      cy.contains('Your tasks,').should('contain.text', name);

      cy.get('input#title').type('Task for R8UC2T1');
      cy.get('input#url').type('video123');
      cy.contains('Create new Task').click();

      cy.get('.container-element img[src*="video123"]').first().click();

      const todoText = 'Incomplete item';
      cy.get('input[placeholder="Add a new todo item"]').type(todoText, { force: true });
      cy.get('input[type="submit"][value="Add"]').click({ force: true });

      cy.contains('.todo-item', todoText).as('newTodo');

      cy.get('@newTodo').find('.checker').click();

      cy.get('@newTodo').find('.checker').should('have.class', 'checked');

      cy.get('@newTodo')
      .find('.editable')
      .should('have.css', 'text-decoration')
      .and('include', 'line-through');
    });

    it('R8UC2T2 - should unmark a done todo (remove strikethrough)', () => {
      cy.visit('http://localhost:3000');
      cy.get('input#email').type(email);
      cy.get('form').submit();

      cy.contains('Your tasks,').should('contain.text', name);

      cy.get('input#title').type('Task for R8UC2T2');
      cy.get('input#url').type('video456');
      cy.contains('Create new Task').click();

      cy.get('.container-element img[src*="video456"]').first().click();

      const todoText = 'Already done';
      cy.get('input[placeholder="Add a new todo item"]').type(todoText, { force: true });
      cy.get('input[type="submit"][value="Add"]').click({ force: true });

      cy.contains('.todo-item', todoText).as('doneTodo');

      cy.get('@doneTodo').find('.checker').click({ force: true });

      cy.get('@doneTodo').find('.checker').click({ force: true });

      cy.get('@doneTodo').find('.checker').should('have.class', 'unchecked');

      cy.get('@doneTodo')
        .find('.editable')
        .should('have.css', 'text-decoration')
        .and('not.include', 'line-through');
    });
    
    it('R8UC3T1 - should remove a todo item from the list', () => {
      cy.visit('http://localhost:3000');
      cy.get('input#email').type(email);
      cy.get('form').submit();

      cy.contains('Your tasks,').should('contain.text', name);

      cy.get('input#title').type('Task for R8UC3T1');
      cy.get('input#url').type('video789');
      cy.contains('Create new Task').click();

      cy.get('.container-element img[src*="video789"]').first().click();

      const todoText = 'Todo to delete';
      cy.get('input[placeholder="Add a new todo item"]').type(todoText, { force: true });
      cy.get('input[type="submit"][value="Add"]').click({ force: true });

      cy.contains('.todo-item', todoText, { timeout: 5000 }).as('deleteTodo');

      cy.get('@deleteTodo').find('.remover').click({ force: true }).click({ force: true });

      cy.contains('.todo-item', todoText, { timeout: 5000 }).should('not.exist');
    });

    after(() => {
      // Cleanup: delete the test user
      if (uid) {
        cy.request('DELETE', `http://localhost:5000/users/${uid}`);
      }
    });
  });
  