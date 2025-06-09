  import { DataTypes } from 'sequelize';
  import sequelize from '../config/database.js';

  
  const Employee = sequelize.define('Customer', {
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'full_name'
    },
    email_address: {
      type: DataTypes.STRING
    },
   
    password: {
      type: DataTypes.STRING
    },
    resetOTP: {
      type: DataTypes.STRING,
      field: 'reset_otp'
    },
    resetOTPExpiry: {
      type: DataTypes.DATE,
      field: 'reset_otp_expiry'
    }
  }, {
    tableName: 'employees',
    timestamps: true
  });
  
  export default Employee;
  