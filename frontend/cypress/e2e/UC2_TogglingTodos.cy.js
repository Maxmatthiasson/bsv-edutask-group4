// cypress/e2e/uc2-toggle-todo.cy.js

describe('UC2: Toggle Todo Item Status', () => {
    let uid, email, name;

    beforeEach(() => {
        // Create a new user via backend before each test.
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
            });
        });
    });

    it('R8UC2T1 - should mark a todo as done (struck through)', () => {
        const todoText = 'Finish this test';
        const task = { title: 'Task for Marking Done', url: 'video123' };

        cy.visit('http://localhost:3000');
        cy.get('input#email').type(email);
        cy.get('form').submit();
        cy.contains('Your tasks,').should('contain.text', name);

        cy.get('input#title').type(task.title);
        cy.get('input#url').type(task.url);
        cy.contains('Create new Task').click();
        cy.get(`.container-element img[src*="${task.url}"]`, { timeout: 10000 }).first().click();
        cy.get('input[placeholder="Add a new todo item"]').type(todoText);
        cy.get('input[type="submit"][value="Add"]').click();

        cy.contains('.todo-item', todoText).as('todoItem');
        cy.get('@todoItem').find('.checker').click();

        cy.get('@todoItem').find('.checker').should('have.class', 'checked');
        cy.get('@todoItem')
            .find('.editable')
            .should('have.css', 'text-decoration')
            .and('include', 'line-through');
    });

    it('R8UC2T2 - should unmark a done todo (remove strikethrough)', () => {
        const todoText = 'This was already done';
        const task = { title: 'Task for Unmarking', url: 'video456' };

        cy.visit('http://localhost:3000');
        cy.get('input#email').type(email);
        cy.get('form').submit();
        cy.contains('Your tasks,').should('contain.text', name);

        cy.get('input#title').type(task.title);
        cy.get('input#url').type(task.url);
        cy.contains('Create new Task').click();
        cy.get(`.container-element img[src*="${task.url}"]`, { timeout: 10000 }).first().click();
        cy.get('input[placeholder="Add a new todo item"]').type(todoText);
        cy.get('input[type="submit"][value="Add"]').click();

        cy.contains('.todo-item', todoText).as('doneTodo');
        cy.get('@doneTodo').find('.checker').click();
        cy.get('@doneTodo').find('.checker').should('have.class', 'checked');

        cy.get('@doneTodo').find('.checker').click();

        cy.get('@doneTodo').find('.checker').should('have.class', 'unchecked');
        cy.get('@doneTodo')
            .find('.editable')
            .should('have.css', 'text-decoration')
            .and('not.include', 'line-through');
    });

    afterEach(() => {
        if (uid) {
            cy.request('DELETE', `http://localhost:5000/users/${uid}`);
        }
    });
});