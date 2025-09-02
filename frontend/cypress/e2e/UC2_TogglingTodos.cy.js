describe('UC2: Toggle Todo Item Status', () => {
    let uid, email, name, taskId;

    const taskData = {
        title: 'My Test Task',
        url: 'video123'
    };

    const todoData = 'task todo';

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

    it('R8UC2T1 - should mark a todo as done (struck through)', () => {

        cy.visit('http://localhost:3000');
        cy.get('input#email').type(email);
        cy.get('form').submit();
        cy.contains('Your tasks,').should('contain.text', name);
        
        cy.get(`.container-element img[src*="${taskData.url}"]`, { timeout: 10000 }).first().should('be.visible').click();
        
        cy.contains('.todo-item', todoData).as('todoItem');
        cy.get('@todoItem').find('.checker').click();
        
        cy.get('@todoItem').find('.checker').should('have.class', 'checked');
        cy.get('@todoItem').find('.editable')
            .should('have.css', 'text-decoration')
            .and('include', 'line-through');
    });

    it('R8UC2T2 - should unmark a done todo (remove strikethrough)', () => {

        cy.visit('http://localhost:3000');
        cy.get('input#email').type(email);
        cy.get('form').submit();
        cy.contains('Your tasks,').should('contain.text', name);

        cy.get(`.container-element img[src*="${taskData.url}"]`, { timeout: 10000 }).first().should('be.visible').click();
        
        // Setting the todo to done via the backend since its reliable and the frontend is still being tested.
        cy.request({
            method: 'PUT',
            url: `http://localhost:5000/todos/byid/${taskId}`,
            body: { data: JSON.stringify({ $set: { done: true } }) }
        });
        
        cy.reload();
        cy.contains('.todo-item', todoData).as('doneTodo');
        cy.get('@doneTodo').find('.checker').should('have.class', 'checked');

        cy.get('@doneTodo').find('.checker').click();
        
        cy.get('@doneTodo').find('.checker').should('have.class', 'unchecked');
        cy.get('@doneTodo').find('.editable')
            .should('have.css', 'text-decoration')
            .and('not.include', 'line-through');
    });

    afterEach(() => {
        if (uid) {
            cy.request('DELETE', `http://localhost:5000/users/${uid}`);
        }
    });
});