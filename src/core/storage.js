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
        
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      
      input.click();
    });
  }
}