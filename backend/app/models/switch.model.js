module.exports = (db) => {
    var sequelize = db.sequelize;
    var Sequelize = db.Sequelize;
    const Switch = sequelize.define("switches", 
        {
        switchId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        ipAddress: {
            type: Sequelize.STRING,
        },
        username: {
            type: Sequelize.STRING,
        },
        password: {
            type: Sequelize.STRING,
        },
    });
    return Switch;
};