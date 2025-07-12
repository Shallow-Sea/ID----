const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Card = sequelize.define('Card', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cardCode: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.ENUM('day', 'month', 'year', 'custom'),
      allowNull: false,
      defaultValue: 'month'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30, // 默认30天
      comment: '有效期天数'
    },
    status: {
      type: DataTypes.ENUM('unused', 'used', 'expired'),
      allowNull: false,
      defaultValue: 'unused'
    },
    activatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '激活时间'
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '过期时间'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    userInfo: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '使用者信息'
    },
    remark: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'cards',
    timestamps: true,
    hooks: {
      beforeCreate: (card) => {
        // 如果没有指定卡密，则生成一个UUID作为卡密
        if (!card.cardCode) {
          card.cardCode = uuidv4().replace(/-/g, '');
        }
      }
    }
  });
  
  // 激活卡密
  Card.prototype.activate = async function(userInfo = {}) {
    const now = new Date();
    this.activatedAt = now;
    
    // 计算过期时间
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + this.duration);
    
    this.expiresAt = expiresAt;
    this.status = 'used';
    this.userInfo = userInfo;
    
    await this.save();
    return this;
  };
  
  // 检查卡密是否有效
  Card.prototype.isValid = function() {
    if (this.status !== 'used') return false;
    
    const now = new Date();
    if (!this.expiresAt) return false;
    
    const isValid = this.expiresAt > now;
    
    // 如果已过期但状态未更新，则更新状态
    if (!isValid && this.status !== 'expired') {
      this.status = 'expired';
      this.save();
    }
    
    return isValid;
  };
  
  // 根据卡密类型计算天数
  Card.getDurationByType = function(type) {
    switch (type) {
      case 'day':
        return 1;
      case 'month':
        return 30;
      case 'year':
        return 365;
      default:
        return 30; // 默认30天
    }
  };
  
  // 生成随机卡密
  Card.generateRandomCode = function(prefix = '') {
    const uuid = uuidv4().replace(/-/g, '');
    return `${prefix}${uuid}`.substring(0, 32);
  };
  
  // 关联
  Card.associate = function(models) {
    Card.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    Card.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
  };
  
  return Card;
}; 