
// import { validateInput } from '../../src/services/validate-input.mts'
import { validateInput } from '../../dist/services/validate-input.mjs'



describe('validateInput', () => {
    it("return true when all input present", async () => {
        const inputObject = {
            name: 'Luke Skywalker',
            email: 'Luke@gmail.com',
            username: 'overratedjedi1111'
        };
        const requiredFields = ['name', 'email', 'username'];

        const result = await validateInput(inputObject, requiredFields);
        expect(result).toBe(true);

    }),
    it('should return false when required input is missing', async () => {
        const inputObject = {
            email: 'anakin@hotmail.com',
            username: 'darth_vader'
        };
        const requiredFields = ['name', 'email', 'username'];
        
        const result = await validateInput(inputObject, requiredFields);
        expect(result).toBe(false);
    });

})