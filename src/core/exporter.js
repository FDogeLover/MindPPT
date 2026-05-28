function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export class Exporter {
  exportToHtml(projectData) {
    try {
      const html = this.generateHtml(projectData);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectData.name || 'mindmap'}.html`;
      document.body.appendChild(a);
      a.click();
      
      // 延迟清理，确保下载开始
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      alert('HTML文件导出成功');
    } catch (error) {
      console.error('导出HTML失败:', error);
      alert('导出HTML失败：' + error.message);
    }
  }

  generateHtml(projectData) {
    const nodesHtml = this.generateNodesHtml(projectData.nodes || []);
    const escapedName = escapeHtml(projectData.name || '思维导图PPT');
    
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapedName}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fcfcf8; }
    .container { max-width: 1200px; margin: 0 auto; padding: 24px; }
    h1 { color: #183a4a; text-align: center; margin-bottom: 32px; }
    .nodes { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; }
    .node { width: 200px; padding: 16px; background: white; border: 2px solid #eee; border-radius: 8px; }
    .node.active { border-color: #183a4a; background: #183a4a; color: white; }
    .node-subtitle { font-size: 0.8rem; color: #666; margin-bottom: 4px; }
    .node.active .node-subtitle { color: rgba(255,255,255,0.7); }
    .node-title { font-size: 1rem; font-weight: 600; }
    .node-image { width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapedName}</h1>
    <div class="nodes">
      ${nodesHtml}
    </div>
  </div>
</body>
</html>`;
  }

  generateNodesHtml(nodes) {
    return nodes.map(node => {
      const escapedTitle = escapeHtml(node.title || '未命名');
      const escapedSubtitle = node.subtitle ? escapeHtml(node.subtitle) : '';
      const escapedImageSrc = node.image ? escapeHtml(node.image.src) : '';
      const escapedImageAlt = node.image ? escapeHtml(node.image.alt || '') : '';
      
      return `
        <div class="node">
          ${node.image ? `<img src="${escapedImageSrc}" alt="${escapedImageAlt}" class="node-image">` : ''}
          <div class="node-text">
            ${escapedSubtitle ? `<div class="node-subtitle">${escapedSubtitle}</div>` : ''}
            <div class="node-title">${escapedTitle}</div>
          </div>
        </div>
      `;
    }).join('');
  }
}
