module.exports = (sequelize, DataTypes) => {
  const Content = sequelize.define('Content', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft'
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'article'
    },
    coverImage: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'contents',
    timestamps: true
  });
  
  // 关联
  Content.associate = function(models) {
    Content.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    
    Content.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updater'
    });
  };
  
  // 增加浏览次数
  Content.prototype.incrementView = async function() {
    this.viewCount += 1;
    await this.save();
    return this;
  };
  
  return Content;
}; 