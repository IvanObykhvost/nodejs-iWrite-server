let rand = function() {
    return Math.random().toString(36).substr(2); // remove `0.`
};

function Generate(){
    this.token = () => {
        return rand() + rand();
    }
}

module.exports.Generate = new Generate();