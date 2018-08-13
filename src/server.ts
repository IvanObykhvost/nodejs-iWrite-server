import app from "./app";

const PORT = process.env.POR || 4082;

app.listen(PORT, () => {
    console.log('Express server listening on port ' + PORT);
});