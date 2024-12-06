## Expensive AWS clusters
* My conclusion according to AWS if we need ECS it costs to us many dollars for nothing. While we're yet start up let leave the expensive services and change them with something cheaper. I found many solutions that would scale a project properly as well. Because if we need a good, really good solution in AWS we will need the following services dependent on ECS:
- EFS external hard drive . Here is important to know that the default EFS is on demand. If we need something faster the cost is growing up
  Formula:
```
  Effective storage cost = (500 * 20%) * ($0.16) + (500 * 80%) * ($0.0133) / 500 =
= ($16 + $5.32)/500
= $0.043/GB-Month
```

  Because we don't know when some instance will shutdown without a reason we need an external hard drive to keep our containers information there.
  It's a practice in AWS because they are handling with many instances which is normal
  
- Load balancer - initial price 18$ . It can be grow up faster
- Amazon Elastic Container service(ECS) - My calculations without tax -> 37$ initially but with tax and some other necessary things i'm sure will catch 50$

Note: if i'm missing something please add it here

Other solutions:
* https://supabase.com - You can run your database, user management, file hosting and front-end edge hosting with edge ssr for free
* K8s - we can change the expensive ECS with the open source container management. 
Regarding Auto scaling, it is something k8s can do for you. So in your cluster you will have a set of nodes. Every node is just a VPS, or virtual machine, or real machine. It's a host for containers.
Any 'deployment' is just a number of replicas of a container.
You can auto scale to increase the number of replicas based on certain metrics.
You can also scale the number of nodes based on certain metrics.
So as long as the k8s host supports it (which is most), you can scale from 1 node running a handful of containers to 100 nodes running countless replicas. All based on live usage metrics.
About many traffic then small traffic and again grow up can be handled by two ways:
- I think you can scale down based on averages, rather than live metrics. So if the load peaks, it immediately scales up, then when it averages down to a lower average (meaning it has to be quiet for a while) then it scales down again.
- You can also have it scale up automatically, and scale down manually only which is good as well.

In fact k8s allows you to run mutli datacenter clusters where different clusters in different data centers load balance in between. For hosting we can use:
[Digital Ocean Self Hosting](https://www.digitalocean.com/go/developer-brand?utm_campaign=emea_brand_kw_en_cpc&utm_adgroup=digitalocean_exact_exact&_keyword=digital%20ocean&_device=c&_adposition=&utm_content=conversion&utm_medium=cpc&utm_source=google&gclid=Cj0KCQiA99ybBhD9ARIsALvZavUYJG4qvqVeLZC1OODMkbMdQJRc-sQNJ2Wqm3jT15cj8-xmrPblaTwaAn3EEALw_wcB)