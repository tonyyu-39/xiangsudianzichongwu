// 版本信息管理
export class VersionManager {
  private static _version: string | null = null
  private static _buildTime: string | null = null

  // 获取版本号
  static getVersion(): string {
    if (this._version === null) {
      // 在生产环境中，这些值会在构建时被替换
      this._version = import.meta.env.VITE_APP_VERSION || '0.0.0'
    }
    return this._version
  }

  // 获取构建时间
  static getBuildTime(): string {
    if (this._buildTime === null) {
      // 在生产环境中，这个值会在构建时被替换
      this._buildTime = import.meta.env.VITE_BUILD_TIME || new Date().toISOString()
    }
    return this._buildTime
  }

  // 格式化构建时间显示
  static getFormattedBuildTime(): string {
    const buildTime = this.getBuildTime()
    try {
      const date = new Date(buildTime)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return new Date().toLocaleDateString('zh-CN')
    }
  }

  // 获取版本信息对象
  static getVersionInfo() {
    return {
      version: this.getVersion(),
      buildTime: this.getBuildTime(),
      formattedBuildTime: this.getFormattedBuildTime()
    }
  }

  // 检查是否有新版本（预留接口）
  static async checkForUpdates(): Promise<{ hasUpdate: boolean; latestVersion?: string }> {
    // 这里可以实现版本检查逻辑，比如从API获取最新版本
    // 目前返回无更新
    return { hasUpdate: false }
  }
}

// 导出便捷函数
export const getVersion = () => VersionManager.getVersion()
export const getBuildTime = () => VersionManager.getBuildTime()
export const getFormattedBuildTime = () => VersionManager.getFormattedBuildTime()
export const getVersionInfo = () => VersionManager.getVersionInfo()