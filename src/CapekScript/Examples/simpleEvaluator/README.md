# Simple Eval Bot

This bot can evaluate expressions of addition or subtraction with 2 numeric operand. It does not handle nested operations like (2 + 2) - (5 + 6). 
It does not need any initialisation or timing events. It only responds to messages of the form 
`!eval expression`
All needed variables are declared within the scope of message responses. This is slightly slower than allocating them in advance in an init stage, but means the bot uses no memory when it isn't being interacted with, outside of the memory used by the bot system as a whole interpretting Capek and piping messages to it and generally keeping the program's source in memory.