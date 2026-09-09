---
title: My Most Productive Computer in Italy Was the One I Left at Home
date: "2026-09-01 23:36"
excerpt: "What I learned by separating the laptop I carried from the machine where my AI agents actually worked."
template: post
---

In Italy, the computer doing most of my work was not the MacBook Air in my bag. It was the 16-inch MacBook Pro I had left powered on at home, roughly 6,000 miles away.

I used the Air, and sometimes my iPhone, as control surfaces. The home Mac held the repositories, credentials, tools, memory, and local configuration. More importantly, it remained in one place. If my travel laptop changed networks, ran out of battery, went through airport security, or lost connectivity, work already running at home could continue.

That distinction changed how I thought about remote agent workflows. I had not merely found a way to access a faster computer. I had separated the control plane from the execution plane. Once those two planes were separate, I could choose tools for planning, implementation, review, testing, deployment, and access without requiring one laptop or one agent to do everything.

The result was useful, but not magical. I still reviewed plans, answered questions, redirected work, and handled failures. The workflow worked because the parts had explicit roles and because losing one path into the system did not necessarily stop the system itself.

## The laptop in my bag was a control plane

A normal laptop workflow puts control and execution on the same machine. The keyboard, editor, repository, processes, browser, credentials, and network connection all travel together. This is simple until a long-running task outlives the conditions around that laptop.

Travel makes those conditions unstable. A lid closes. Wi-Fi changes. A battery drains. A device must be put away. If the traveling machine is also the worker, each ordinary interruption can become an infrastructure event.

My home Mac served as the execution plane. It was the stable place where code could be checked out, tools could run, and active sessions could continue. The Air and iPhone were ways to inspect, direct, and recover that work. Their job was not to contain all of the state required to perform it.

This was the rough shape of the system:

```text
+---------------------------+
| MacBook Air and iPhone    |
| review, approve, redirect |
+-------------+-------------+
              |
              | control paths
              v
+-------------+--------------------------------------+
| Codex Remote | Herdr | Screen Sharing | SSH        |
+-------------+--------------------------------------+
              |
              v
+----------------------------------------------------+
| Home Mac: persistent execution plane               |
|                                                    |
| Claude CLI -> plan                                 |
| Codex      -> coordinate, review, test, deploy     |
| Pi         -> implement through tools/instructions |
|                                                    |
| Repositories | credentials | tools | local config  |
+--------------------------+-------------------------+
                           |
                           v
                 production verification
```

The arrows are a conceptual model, not a claim that every task followed one fixed transport or exact configuration. The useful point is where state lived. The devices I carried could disappear for a while without taking the working environment with them.

## Persistent state mattered more than remote compute

I had experimented with `pi-embark` as a way to dispatch work to a persistent virtual machine. A VM is attractive for obvious reasons: it is designed to stay online, can be provisioned deliberately, and can make the execution environment less dependent on a physical computer in a house.

But persistence is not only uptime. It is also the accumulated state that makes a machine useful.

The home Mac already had my repositories, credentials, tools, RAM, and local configuration. Moving execution to a VM would have meant recreating enough of that environment to make it equivalent. Some parts could be scripted. Other parts would require careful migration, new trust decisions, or ongoing synchronization. The supposedly cleaner machine would initially be the less capable one.

So the home Mac was the practical choice, not necessarily the ideal universal architecture. It had low setup cost because the environment already existed. It also had clear tradeoffs. A physical workstation can lose power or network access. It can need an update or a reboot. It is harder to replace than a disposable VM. And because it contains credentials and broad local context, its compromise would have a larger blast radius than the compromise of a narrowly scoped worker.

A VM would shift those tradeoffs rather than remove them. It could improve reproducibility and replacement, while adding environment maintenance and forcing decisions about which repositories, secrets, browsers, and local services belong there. The right question was not, "Which host is more cloud-like?" It was, "Where can useful state persist with acceptable operational and security cost?" For this trip, the already-configured Mac won.

## I gave each agent a narrower job

The working sequence was close to this:

1. I described the outcome I wanted.
2. Claude CLI produced a plan.
3. Codex reviewed the plan and delegated implementation.
4. Pi changed the code using my custom instructions and tools.
5. Codex inspected the result and tested it locally in its browser.
6. Codex deployed the change.
7. Codex repeated the relevant browser tests in production.

Herdr also handled some direct Pi sessions when I wanted a more direct route to implementation.

There was overlap in what these tools could do. That did not mean their roles should be interchangeable. Explicit boundaries made it easier to reason about errors. If a plan was weak, I knew to revisit planning and review rather than asking the implementation loop to improvise around it. If the code diverged from the plan, inspection happened before deployment. If behavior differed after deployment, production verification had its own place in the sequence.

This is a general advantage of specialization: it creates checkpoints. A universal agent can appear simpler because one system owns the entire task, but it also collapses planning, execution, approval, and verification into one context. When something goes wrong, the failure is harder to locate. Separate roles add handoffs, and handoffs cost time, but they also create places to stop and ask whether the work still matches the intent.

Human approval remained one of those boundaries. I did not disappear after writing a prompt. I reviewed plans, answered questions, redirected work, and decided how to respond to failures. That limited autonomy, but it also limited the cost of a confident mistake. The workflow was productive precisely because I could intervene without having to perform every edit myself.

## Routing was also failure isolation

Pi performed implementation through custom instructions and tools, with [`pi-auto-router`](https://github.com/danialranjha/pi-auto-router) spreading work across multiple provider subscriptions. The immediate benefit was practical: I was less dependent on one subscription quota, and I did not need to use metered API access for every task.

The deeper benefit was failure isolation. A single provider quota can become a shared point of failure if every implementation task depends on it. Routing lets work move across available subscriptions instead of treating one quota as the capacity of the whole system.

This does not create free or unlimited capacity. Subscription limits still exist, providers differ, and routing adds another decision layer that can fail or make an unsuitable choice. It can also make behavior less uniform because tasks may be handled by different models. The router reduces dependence on one quota; it does not remove the need to review output.

There is a useful operational distinction here. Load balancing usually suggests interchangeable workers serving the same kind of request. Agent work is not always that clean. Models can have different strengths, context limits, and failure modes. My routing setup was a way to use the subscriptions available to me, not a benchmark proving that every routed provider was equivalent. The review and test stages were what allowed heterogeneous implementation capacity to be useful without assuming uniform results.

## Local and production were two different facts

Codex did not stop after inspecting a diff. It ran relevant browser tests locally, deployed, and then repeated relevant tests against production.

That second pass mattered. A local success establishes that the code can work in the local environment. It does not establish that the deployed application does work under production routing, configuration, assets, data, and infrastructure.

Browser QA repeatedly caught classes of problems that code review alone could miss: broken state transitions, navigation errors, and differences between local and production behavior. These are not exotic failures. They happen at boundaries. A component can render correctly but move into the wrong state after an interaction. A link can be syntactically valid but send the user to the wrong place. A local route can work while production path handling behaves differently.

The sequence therefore made two separate claims:

- Local verification asked whether the implementation behaved correctly before release.
- Production verification asked whether the released system behaved correctly in its actual environment.

Neither claim implied complete coverage. Repeating the relevant browser checks was targeted verification, not proof that every path was correct. But keeping the two stages separate prevented a common mistake: treating a successful local run as evidence about a deployment that had not yet been exercised.

## Multiple access paths were intentional overlap

I used Codex Remote for the main loop and Herdr for direct Pi jobs. Screen sharing covered desktop-only setup. Tailscale and SSH gave me machine access and supported cron jobs that pulled Google Search Console and Meta advertising data.

At first glance, this looks redundant. It was. The redundancy was useful because the paths failed differently.

During the trip, screen sharing crashed while active jobs and SSH access remained available. I avoided rebooting the Mac because long-running tasks were active. Losing the graphical control path was inconvenient, but it did not stop execution. The machine and its jobs were a different failure domain from the screen-sharing session.

That incident clarified the value of layered access. Screen sharing is broad and visually direct, but it depends on a functioning desktop session and can be awkward on a phone or weak connection. A remote agent interface can expose the task loop more cleanly, but it may not reach desktop-only setup. SSH is narrower and less visual, yet it can remain useful when a graphical path fails. Tailscale provides the private network path in this setup, while SSH provides a way to act on the machine over that path.

Overlapping access methods also increase complexity and security surface. Each path needs to be understood, maintained, and protected. Redundancy is not automatically resilience; two tools that depend on the same broken desktop session are still one failure domain. The point is to choose paths with different dependencies, then know which one can be used without disturbing active work.

## Credentials made the execution plane powerful and risky

The home Mac was useful partly because it already held credentials. That is also the reason to be cautious about this pattern.

An agent that can edit a repository may not need permission to deploy it. A process that pulls analytics data may not need access to unrelated project secrets. A remote control interface may need to start or inspect tasks without receiving every credential stored on the host. These are separate trust boundaries even when all of them happen on one physical machine.

I do not want to imply an exact security configuration that I have not described. The engineering principle is narrower: capability should follow role. Planning needs context about the desired result. Implementation needs the repository and tools required to change it. Deployment needs release authority. Production testing needs access to the deployed surface. Remote administration can reach much more than any one task, so it deserves correspondingly careful treatment.

A persistent workstation tends to accumulate permissions over time. That makes it convenient and raises the cost of mistakes. The more autonomous the execution loop becomes, the more important it is to know which action crosses from reading to writing, from local work to deployment, and from ordinary operation to recovery. Human approvals are friction, but at those boundaries friction can be a control rather than a defect.

## The largest gap was recovery, not execution

The rough edges were mostly about preserving and recovering control state.

Remote task ordering did not preserve the pins I used on the desktop. Creating a task remotely inside a selected project or worktree was awkward and often required screen sharing. Most importantly, safe session persistence and recovery remained the largest gap.

The improvements I wanted were concrete:

- Preserve pinned projects and tasks in the remote interface.
- Create a remote task directly in a chosen project or worktree.
- Recover the remote interface without terminating active sessions.

These sound like interface details, but they are really observability and recoverability problems. A remote system is not operable merely because its processes stay alive. I need to know what is running, where it is running, which repository or worktree it belongs to, what it is waiting for, and how to regain control without destroying useful state.

That last condition is easy to miss. Restarting is a valid recovery strategy only when active work is disposable or safely checkpointed. In Italy, rebooting the home Mac would have restored one control path by terminating long-running work in another. The system lacked a clean way to recover the interface independently from the sessions it controlled.

Better session persistence would separate task identity and state from any particular client connection. Better observability would make pending questions, active processes, project context, and recent results visible after reconnecting. I am describing the direction, not claiming those mechanisms already existed in my setup. What existed was enough execution persistence to keep jobs alive, but not enough control-plane persistence to make recovery routine.

## The system was useful because it was not one system

The surprising part of working from Italy was not that remote access worked. Remote access has existed for a long time. It was that a collection of narrower tools worked better for me than asking one universal agent, on the laptop in front of me, to own the whole process.

Claude planned. Codex coordinated, reviewed, tested, deployed, and verified. Pi implemented. `pi-auto-router` reduced dependence on a single subscription quota. Codex Remote and Herdr exposed task-oriented control paths. Screen sharing handled desktop-only work. Tailscale and SSH provided a lower-level route to the machine and its scheduled jobs. I remained in the loop where judgment or recovery was required.

This architecture had costs: more handoffs, more access paths, more trust boundaries, and more state to understand. It also gave failures somewhere to stop. A quota problem did not have to block every implementation path. A dead travel connection did not have to kill the worker. A crashed screen-sharing session did not have to terminate active jobs. A passing local test did not have to be mistaken for a passing production test.

The most productive computer I had in Italy stayed productive because it did not travel with me. But the more durable lesson was not about that Mac. It was about placing execution on a persistent plane, keeping control replaceable, and accepting that reliable agent work still needs explicit roles, verification, and a human who knows when not to reboot.

This post expands on my original [X Article](https://x.com/danialranjha/status/2095038168164868331), "My Most Productive Computer in Italy Was the One I Left at Home."
