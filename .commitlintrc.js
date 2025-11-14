module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复 bug
        'docs',     // 文档变更
        'style',    // 代码格式（不影响代码运行）
        'refactor', // 重构
        'perf',     // 性能优化
        'test',     // 测试相关
        'build',    // 构建系统或外部依赖变更
        'ci',       // CI 配置文件和脚本变更
        'chore',    // 其他不修改 src 或 test 的变更
        'revert',   // 回退 commit
      ],
    ],
    'subject-case': [0],
  },
};
