module.exports = (sequelize, DataTypes) => {
  const Setting = sequelize.define('Setting', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    key: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('string', 'number', 'boolean', 'json', 'array'),
      defaultValue: 'string'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否为系统设置'
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'settings',
    timestamps: true
  });
  
  // 关联
  Setting.associate = function(models) {
    Setting.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updater'
    });
  };
  
  // 获取设置值（自动根据类型转换）
  Setting.prototype.getValue = function() {
    if (!this.value) return null;
    
    try {
      switch (this.type) {
        case 'number':
          return Number(this.value);
        case 'boolean':
          return this.value === 'true' || this.value === '1';
        case 'json':
        case 'array':
          return JSON.parse(this.value);
        default:
          return this.value;
      }
    } catch (error) {
      return this.value;
    }
  };
  
  // 设置值（自动根据类型转换）
  Setting.prototype.setValue = function(value) {
    switch (this.type) {
      case 'json':
      case 'array':
        this.value = JSON.stringify(value);
        break;
      default:
        this.value = String(value);
    }
  };
  
  // 获取所有设置，并以键值对形式返回
  Setting.getAllSettings = async function() {
    const settings = await this.findAll();
    const result = {};
    
    for (const setting of settings) {
      result[setting.key] = setting.getValue();
    }
    
    return result;
  };
  
  // 获取或创建设置
  Setting.getOrCreate = async function(key, defaultValue = '', type = 'string', description = '') {
    const [setting, created] = await this.findOrCreate({
      where: { key },
      defaults: {
        value: type === 'json' || type === 'array' ? JSON.stringify(defaultValue) : String(defaultValue),
        type,
        description
      }
    });
    
    return setting;
  };
  
  return Setting;
}; 