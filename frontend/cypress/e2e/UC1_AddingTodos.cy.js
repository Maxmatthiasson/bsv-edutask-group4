describe('UC1: Add Todo Item', () => {
    let uid, email, name, taskId;

    // Task data that is used when creating a task in the setup
    const taskData = {
        title: 'My Test Task',
        url: 'dQw4w9WgXcQ'
    };

    beforeEach(() => {
        // Create a new user via the backend before each test
        cy.fixture('user.json').then((user) => {
            email = `test-${Date.now()}@example.com`;
            name = `${user.firstName} ${user.lastName}`;
            
            cy.request({
                method: 'POST',
                url: 'http://localhost:5000/users/create',
                form: true,
                body: { ...user, email: email }
            }).then((response) => {
                uid = response.body._id.$oid;

                // Creates a new task via the backend before each test.
                cy.request({
                    method: 'POST',
                    url: 'http://localhost:5000/tasks/create',
                    form: true,
                    body: {
                        userid: uid,
                        title: taskData.title,
                        url: taskData.url,
                        todos: ['Learn Cypress']
                    }
                }).then((taskResponse) => {
                    taskId = taskResponse.body[0]._id.$oid;
                });
            });
        });
    });

    it('R8UCT2 - should append new todo item in task detail view', () => {

        cy.visit('http://localhost:3000');
        cy.get('input#email').type(email);
        cy.get('form').submit();
        cy.contains('Your tasks,').should('contain.text', name);

        cy.get(`.container-element img[src*="${taskData.url}"]`, { timeout: 10000 }).first().should('be.visible').click();

        const newTodoText = 'My new todo item';
        cy.get('input[placeholder="Add a new todo item"]').type(newTodoText);
        cy.get('input[type="submit"][value="Add"]').click();

        cy.get('.todo-list .todo-item').last().should('contain.text', newTodoText);
    });

    it('R8UC1T1 - should NOT add a todo item when description is empty', () => {

        cy.visit('http://localhost:3000');
        cy.get('input#email').type(email);
        cy.get('form').submit();
        cy.contains('Your tasks,').should('contain.text', name);
        
        cy.get(`.container-element img[src*="${taskData.url}"]`, { timeout: 10000 }).first().click();

        cy.get('.todo-list .todo-item').then((itemsBefore) => {
            const initialCount = itemsBefore.length;

            cy.get('input[placeholder="Add a new todo item"]').clear();
            cy.get('input[type="submit"][value="Add"]').click({ force: true });

            cy.wait(500);
            cy.get('.todo-list .todo-item').should('have.length', initialCount);
        });
    });

    afterEach(() => {
        if (uid) {
            cy.request('DELETE', `http://localhost:5000/users/${uid}`);
        }
    });
});