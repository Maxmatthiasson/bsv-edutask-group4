describe('UC3: Remove Todo Item', () => {
    let uid, email, name, taskId;

    const taskData = {
        title: 'Task for Deleting Todo',
        url: 'video789'
    };

    const todoData = 'This todo should be deleted';

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

                // Create a new task via the backend before each test
                cy.request({
                    method: 'POST',
                    url: 'http://localhost:5000/tasks/create',
                    form: true,
                    body: {
                        userid: uid,
                        title: taskData.title,
                        url: taskData.url,
                        todos: [todoData]
                    }
                }).then((taskResponse) => {
                    taskId = taskResponse.body[0]._id.$oid;
                });
            });
        });
    });

    it('R8UC3T1 - should remove a todo item from the list', () => {

        cy.visit('http://localhost:3000');
        cy.get('input#email').type(email);
        cy.get('form').submit();
        cy.contains('Your tasks,').should('contain.text', name);

        cy.get(`.container-element img[src*="${taskData.url}"]`, { timeout: 10000 }).first().should('be.visible').click();

        // Click remove once. No longer doing it twice.
        cy.contains('.todo-item', todoData).as('todoToDelete');
        cy.get('@todoToDelete').find('.remover').click();

        cy.contains('.todo-item', todoData).should('not.exist');
    });

    afterEach(() => {
        if (uid) {
            cy.request('DELETE', `http://localhost:5000/users/${uid}`);
        }
    });
});