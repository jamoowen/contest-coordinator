import express, { Request, Response } from 'express';

export async function validateInput(inputObject:any, requiredFields: string[]) {

    try {
        for (let field of requiredFields) {
            const inputField = inputObject[field]
            if (!inputField) {
                console.log("failed validate input")
                return false
            }
        }
        return true
        
    } catch (error) {
        console.log("failed validate input")
        return false
    
    }
}
