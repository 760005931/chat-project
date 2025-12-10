# 🎓 Git 实战生存指南 (The Git Survival Guide)

这份指南旨在帮助你从“会用 Git”进阶到“懂 Git”，涵盖了日常开发中最常用的场景和面试中常问的 Git 知识点。

## 🔄 1. 日常开发工作流 (The Daily Cycle)

这是你每天会重复无数次的操作：

```bash
# 1. 拉取最新代码 (每天开工第一件事)
git pull

# 2. 查看当前状态 (修改了哪些文件？)
git status

# 3. 添加修改到暂存区
git add .            # 添加所有修改
git add src/App.jsx  # 只添加特定文件 (推荐，更严谨)

# 4. 提交修改 (Commit Message 要清晰！)
git commit -m "feat: 增加登录页面表单验证" 
# 格式推荐: type: description (feat/fix/docs/style/refactor)

# 5. 推送到远程仓库
git push
```

---

## ⚔️ 2. 解决冲突与同步 (Handling Conflicts)

当你和同事修改了同一个文件，或者远程有新代码时，`git push` 会失败。

### 场景 A：远程有新代码，但我本地也有修改 (Divergent Branches)
这就是你刚才遇到的情况。

*   **方法一：Rebase (变基) —— 推荐**
    ```bash
    git pull --rebase
    ```
    *   **效果**：把你的提交“接”在远程最新提交的后面。
    *   **优点**：提交记录是一条直线，干净漂亮。

*   **方法二：Merge (合并)**
    ```bash
    git pull --no-rebase
    ```
    *   **效果**：产生一个新的 Merge Commit。
    *   **优点**：保留真实的时间线，操作简单。

### 场景 B：真正的代码冲突 (Conflict)
当 `git pull` 提示 `CONFLICT` 时：

1.  打开冲突文件，你会看到：
    ```
    <<<<<<< HEAD
    你的代码
    =======
    远程的代码
    >>>>>>> branch-name
    ```
2.  **手动修改**：保留需要的代码，删除 `<<<`, `===`, `>>>` 标记。
3.  **标记解决**：
    ```bash
    git add 冲突的文件
    git rebase --continue  # 如果是 rebase 过程中
    # 或者
    git commit             # 如果是 merge 过程中
    ```

---

## 🌿 3. 分支管理 (Branch Management)

在大厂，绝对不允许直接在 `main` 分支上写代码。

```bash
# 1. 创建并切换到新分支 (Feature Branch)
git checkout -b feature/login-page

# ... 写代码，提交 ...

# 2. 切回主分支
git checkout main

# 3. 拉取主分支最新代码
git pull

# 4. 把你的分支合并回主分支 (通常在网页端提 Pull Request，但在本地也可以)
git merge feature/login-page

# 5. 删除功能分支
git branch -d feature/login-page
```

---

## ⏪ 4. 后悔药 (Undo Operations)

*   **撤销 `git add` (文件还没 commit)**
    ```bash
    git reset HEAD <file>
    ```

*   **撤销最近一次 commit (代码保留，回到 add 之前的状态)**
    ```bash
    git reset --soft HEAD^
    ```

*   **彻底放弃本地修改 (慎用！代码会丢！)**
    ```bash
    git checkout .
    ```

---

## 💡 5. 大厂面试/工作 Tips

1.  **Squash Commits (合并提交)**
    *   在提 Pull Request (PR) 前，如果你有 10 个 "fix typo" 的琐碎提交，最好把它们合并成一个。
    *   命令：`git rebase -i HEAD~n` (n 是要合并的提交数)。

2.  **Commit Message 规范**
    *   `feat`: 新功能
    *   `fix`: 修 bug
    *   `docs`: 文档修改
    *   `style`: 格式修改 (不影响代码运行)
    *   `refactor`: 重构 (既不是新功能也不是修 bug)

3.  **永远不要 `git push -f` (Force Push)**
    *   除非你非常清楚自己在做什么，并且是在你自己的私有分支上。在公共分支上 Force Push 会导致同事的代码丢失，可能会被打。
