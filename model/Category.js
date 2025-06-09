import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';



const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true 
  }
}, {
  tableName: 'categories',
  timestamps: true
});

export default Category;
