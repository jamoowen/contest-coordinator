import express, { Request, Response } from 'express';

export async function validateInput(inputObject:any, requiredFields: string[]) {
    console.log("checkthis")

    try {
        for (let field of requiredFields) {
            const inputField = inputObject[field]
            if (!inputField) {
                console.log("failed validate input")
                return false
            }
        }
        console.log("returning true")
        return true
        
    } catch (error) {
        console.log("failed validate input")
        return false
    
    }
}
