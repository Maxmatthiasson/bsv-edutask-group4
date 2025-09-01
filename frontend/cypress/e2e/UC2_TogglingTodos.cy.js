describe('UC2: Toggle Todo Item Status', () => {
    let uid, email, name;

    beforeEach(() => {
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
        const todoText = `Finish this test ${Date.now()}`;
        const task = { title: `Task-${Date.now()}`, url: 'video123' };

        cy.visit('http://localhost:3000');
        cy.get('input#email').type(email);
        cy.get('form').submit();
        cy.contains('Your tasks,').should('contain.text', name);

        cy.get('input#title').type(task.title);
        cy.get('input#url').type(task.url);
        cy.contains('Create new Task').click();
        cy.get(`.container-element img[src*="${task.url}"]`).first().click();
        cy.get('input[placeholder="Add a new todo item"]').type(todoText);
        cy.get('input[type="submit"][value="Add"]').click();

        cy.contains('.todo-item', todoText).as('todoItem');

        cy.request('GET', `http://localhost:5000/tasks/ofuser/${uid}`).then((res) => {
            const createdTask = res.body.find(t => t.title === task.title);
            const todoId = createdTask.todos.find(td => td.description === todoText)._id.$oid;

            cy.request({
                method: 'PUT',
                url: `http://localhost:5000/todos/byid/${todoId}`,
                form: true,
                body: { data: JSON.stringify({ $set: { done: false } }) }
            });
        });

        cy.get('@todoItem').find('.checker').click();

        cy.get('@todoItem').find('.checker').should('have.class', 'checked');
        cy.get('@todoItem').find('.editable')
            .should('have.css', 'text-decoration')
            .and('include', 'line-through');
    });

    it('R8UC2T2 - should unmark a done todo (remove strikethrough)', () => {
        const todoText = `This was already done ${Date.now()}`;
        const task = { title: `Task-${Date.now()}`, url: 'video456' };

        cy.visit('http://localhost:3000');
        cy.get('input#email').type(email);
        cy.get('form').submit();
        cy.contains('Your tasks,').should('contain.text', name);

        cy.get('input#title').type(task.title);
        cy.get('input#url').type(task.url);
        cy.contains('Create new Task').click();
        cy.get(`.container-element img[src*="${task.url}"]`).first().click();
        cy.get('input[placeholder="Add a new todo item"]').type(todoText);
        cy.get('input[type="submit"][value="Add"]').click();

        cy.contains('.todo-item', todoText).as('doneTodo');

        cy.request('GET', `http://localhost:5000/tasks/ofuser/${uid}`).then((res) => {
            const createdTask = res.body.find(t => t.title === task.title);
            const todoId = createdTask.todos.find(td => td.description === todoText)._id.$oid;

            cy.request({
                method: 'PUT',
                url: `http://localhost:5000/todos/byid/${todoId}`,
                form: true,
                body: { data: JSON.stringify({ $set: { done: true } }) }
            });
        });

        cy.reload();

        cy.contains('.todo-item', todoText).as('doneTodoAfterReload');
        cy.get('@doneTodoAfterReload').find('.checker').should('have.class', 'checked');

        cy.get('@doneTodoAfterReload').find('.checker').click();

        cy.get('@doneTodoAfterReload').find('.checker').should('have.class', 'unchecked');
        cy.get('@doneTodoAfterReload').find('.editable')
            .should('have.css', 'text-decoration')
            .and('not.include', 'line-through');
    });

    afterEach(() => {
        if (uid) {
            cy.request('DELETE', `http://localhost:5000/users/${uid}`);
        }
    });
});
