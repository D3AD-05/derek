# CONTRIBUTING

When contributing to this repository, please first discuss the change you wish to make via [issues](https://github.com/PentaQube/derek/issues).

Please note if you are working on a certain issue then make sure to stay active with development.

## Git Commit, Branch, and PR Naming Conventions

When you are working with git, please be sure to follow the conventions below on your pull requests, branches, and commits:

```text
PR: [#ISSUE ID] Title of the PR
Branch: [ISSUE ID]-title-of-the-pr (shorter)
Commit: [[ISSUE ID]] [ACTION]: what was done
```

Examples:

```text
PR: #2 Add Docker container for Postgres
Branch: 2-add-container-postgres
Commit: [2] feat: add docker container for postgres
```

## Prerequisites

You will need to [install docker](https://www.docker.com/get-started/) on your local machine.

If you do not have docker, go here to download and install: <https://www.docker.com/get-started/>

## Installation

To get started with Derek locally, follow these steps

1. Make sure you have installed Docker locally (See above Prerequisites)

2. Fork the repository as your own repo

3. Clone forked repo to your local machine

    ```sh
    git clone https://github.com/<YOUR_GITHUB_ACCOUNT_NAME>/derek.git
    ```

4. Navigate to the project directory

    ```sh
    cd derek
    ```

5. Copy backend and frontend .env files.

    ```sh
    cp backend/.env.example backend/.env
    cp frontend/.env.example frontend/.env.development
    ```

6. Run application

   ```sh
   docker compose up --build
   ```
   
7. Get backend container name to be used in next command

   ```sh
   docker ps
   ```

8.  Create first user

    ```sh
    docker exec -it <container_name> python3 cli.py
    ```

Open your browser and visit <http://localhost:5173> to see the application running.

## Working on New Features

If you want to work on a new feature, follow these steps.

1. Fork the repository
2. Clone your fork
3. Checkout a new branch
4. Do your work
5. Commit
6. Push your branch to your fork
7. Go into github UI and create a PR from your fork & branch
8. A contributor will review and approve the PR and merge with MAIN branch

## Pulling in changes from upstream

You should pull in the changes that we add in daily, preferably before you checkout a new branch to do new work.

```sh
git checkout main
```

```sh
git pull upstream main
```

## Code of Conduct

### Our Pledge
In the interest of fostering an open and welcoming environment, we — as contributors, maintainers, and members of the PentaQube community — pledge to make participation in the Derek project a respectful, inclusive, and friendly experience for everyone, regardless of background, experience level, or role. We are committed to giving everyone a meaningful opportunity to contribute.

### Our Standards
We expect all participants to:
1. Be respectful and constructive in all project interactions — code reviews, issue discussions, pull requests, and community channels.
2. Communicate clearly and professionally, keeping feedback focused on the work rather than the individual.
3. Welcome newcomers and help them get oriented with the project.
4. Acknowledge differing viewpoints and resolve disagreements through reasoned discussion.

Unacceptable behaviour includes harassment, personal attacks, dismissiveness toward contributors, and any conduct that creates a hostile environment for participation.

### Our Responsibilities
**Contributors** are expected to:
1. Submit well-considered code changes — whether fixing bugs, improving functionality, or implementing new features — with clarity around intent and impact.
2. Participate actively in discussions, respond to review feedback, and keep pull requests focused and reviewable.
3. Follow Derek's established branching and contribution workflow (feature branches, PRs against main, and so on).

**Maintainers** (PentaQube team members) are responsible for:
1. Reviewing contributions promptly and providing clear, actionable feedback.
2. Setting and communicating project direction, standards, and roadmap.
3. Monitoring the issue tracker and addressing bug reports and feature requests in a timely manner.
4. Enforcing this Code of Conduct fairly and consistently.

### Scope
This Code of Conduct applies within all Derek project spaces — including the GitHub repository, issue tracker, pull requests, and any community discussions — as well as in public spaces when an individual is representing Derek or PentaQube in connection with this project. This includes using official project communication channels, posting via PentaQube's social media accounts, or acting as a representative at online or offline events.

Project maintainers may further define and clarify the boundaries of representation as the community grows.
