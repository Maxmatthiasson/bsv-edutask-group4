describe('UC3: Remove Todo Item', () => {
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

    it('R8UC3T1 - should remove a todo item from the list', () => {
        const todoText = 'This item will be deleted';
        const task = {
            title: 'Task for Deleting Todo',
            url: 'video789'
        };

        cy.visit('http://localhost:3000');
        cy.get('input#email').type(email);
        cy.get('form').submit();
        cy.contains('Your tasks,').should('contain.text', name);

        cy.get('input#title').type(task.title);
        cy.get('input#url').type(task.url);
        cy.contains('Create new Task').click();

        cy.get(`.container-element img[src*="${task.url}"]`, { timeout: 10000 }).first().should('be.visible').click();

        cy.get('input[placeholder="Add a new todo item"]').type(todoText);
        cy.get('input[type="submit"][value="Add"]').click();

        // Click remove once. No longer doing it twice.
        cy.contains('.todo-item', todoText).as('todoToDelete');
        cy.get('@todoToDelete').find('.remover').click();

        cy.contains('.todo-item', todoText).should('not.exist');
    });

    afterEach(() => {
        if (uid) {
            cy.request('DELETE', `http://localhost:5000/users/${uid}`);
        }
    });
});