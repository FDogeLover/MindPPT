export class Storage {
  constructor() {
    this.storageKey = 'mindmap-ppt-project';
  }

  saveProject(projectData) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(projectData));
      return true;
    } catch (error) {
      console.error('保存项目失败:', error);
      
      // 区分不同错误类型
      if (error.name === 'QuotaExceededError') {
        alert('存储空间不足，请尝试导出项目文件或清理浏览器缓存');
      } else if (error.name === 'SecurityError') {
        alert('隐私模式下无法保存项目，请使用文件导出功能');
      } else {
        alert('保存项目失败：' + error.message);
      }
      
      return false;
    }
  }

  loadProject() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('加载项目失败:', error);
      return null;
    }
  }

  clearProject() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('清除项目失败:', error);
      return false;
    }
  }

  exportToFile(projectData) {
    const dataStr = JSON.stringify(projectData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectData.name || 'mindmap'}.mindmap`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  importFromFile() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.mindmap';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
          reject(new Error('未选择文件'));
          return;
        }
        
        // 验证文件大小（限制10MB）
        if (file.size > 10 * 1024 * 1024) {
          reject(new Error('文件大小超过10MB限制'));
          return;
        }
        
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          
          // 验证数据结构
          if (!data || typeof data !== 'object') {
            reject(new Error('无效的项目文件格式'));
            return;
          }
          
          if (!Array.isArray(data.nodes)) {
            reject(new Error('项目文件缺少nodes字段'));
            return;
          }
          
          resolve(data);
        } catch (error) {
          reject(new Error('文件解析失败：' + error.message));
        }
      };
      
      input.click();
    });
  }
}