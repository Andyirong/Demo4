# 项目规范

本目录包含项目的所有规范文档，遵循 OpenSpec 和 Spec Kit 的最佳实践。

## 📋 规范文档

- [项目目录结构](./project-structure.md) - 项目目录组织规范
- [代码风格指南](./code-style.md) - 代码格式和风格规范 (待添加)
- [组件开发规范](./component-guide.md) - React 组件开发指南 (待添加)
- [API 设计规范](./api-design.md) - API 接口设计规范 (待添加)

## 🎯 规范体系

本项目采用规范驱动开发（Spec-Driven Development, SDD）方法：

1. **规范优先** - 所有开发先有规范，后有实现
2. **结构化文档** - 使用 OpenSpec 格式编写规范
3. **自动化执行** - 通过工具确保规范得到遵守

## 📚 相关资源

- [OpenSpec](https://github.com/Fission-AI/OpenSpec) - 规范驱动开发框架
- [Spec Kit](https://github.com/doggy8088/spec-kit) - Spec-Driven Development 工具包
- [ESLint Boundaries](https://github.com/javierbrea/eslint-plugin-boundaries) - 目录结构强制工具

## 🔄 规范更新流程

当需要更新规范时：

1. 创建变更提案：在 `.spec/changes/` 下创建新目录
2. 编写规范更新：使用 OpenSpec 格式
3. 团队评审：通过 Pull Request 评审
4. 更新文档：合并后更新相关规范

---

*最后更新：2024-12-18*