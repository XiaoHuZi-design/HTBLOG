---
title: "SLAM仿真（gazebo）"
date: 2026-01-15
tags: ["ROS", "机器人", "SLAM"]
---

# 差速小车
赵虚左ros1仿真环境上修改

---

## Gmapping建图与导航
```yaml
roslaunch nav_demo nav01_slam.launch
rosrun teleop_twist_keyboard teleop_twist_keyboard.py
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746371799961-7af95c91-5bef-4640-a9c4-73515a0cf9ea.png)

```yaml
roslaunch urdf02_gazebo demo03_env.launch
roslaunch nav_demo nav07_slam_auto.launch
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746368117750-d7ae0874-ed55-42ac-aea9-0a9f607148ac.png)![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746368138949-e0cf60bf-a670-4faf-9cd6-ea5ac91783ec.png)



---

## cartographer建图与导航
### 一、小吃
```yaml
<!--
  Copyright 2016 The Cartographer Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->

<!-- 请复制该文件到cartographer_ros/cartographer_ros/launch中使用 -->
<launch>

  <param name="/use_sim_time" value="true" />

  <node name="cartographer_node" pkg="cartographer_ros" type="cartographer_node" args="  
            -configuration_directory $(find cartographer_ros)/configuration_files  
            -configuration_basename rplidar.lua" output="screen">
    <remap from="scan" to="scan" />
  </node>
  <node name="cartographer_occupancy_grid_node" pkg="cartographer_ros" type="cartographer_occupancy_grid_node" />

  <node name="rviz" pkg="rviz" type="rviz" required="true" args="-d $(find cartographer_ros)/configuration_files/demo_2d.rviz" />
</launch>
```

```yaml
<!-- 集成 SLAM 与导航 实现机器人自主移动的地图构建 -->
<launch>
    <!-- 仿真 -->
    <include file="$(find urdf02_gazebo)/launch/demo03_env.launch"/>
    <!-- SLAM -->
    <include file="$(find cartographer_ros)/launch/cartographer_demo_rplidar.launch"/>
    <!-- 导航中的 move_base -->
    <include file="$(find nav_demo)/launch/nav05_path.launch"/>

</launch>
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746369016397-7ce51f00-c15d-42d6-b2a3-00f3896ae21e.png)![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746373402345-4761118d-c14a-4b46-8adc-63df34dbc716.png)

```yaml
roslaunch nav_demo nav08_cartographer_move_base.launch
rosrun teleop_twist_keyboard teleop_twist_keyboard.py
```

建图没效果，只是不报错， ... (<font style="color:#DF2A3F;">文件放错位置并且没有编译</font>）

---

### 二、正餐
[Ubuntu20安装并使用Cartographer建图导航_libabsl-dev-CSDN博客](https://blog.csdn.net/weixin_64037619/article/details/131330983)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746422191957-9fede424-7bc2-44a3-962a-8cea4c3881fa.png)参考博客新建两个，放入对应目录，编译，

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746422274448-72d363bd-c8db-4c71-a2e9-997c80afea5b.png)

```yaml
catkin_make_isolated --install --use-ninja
可能报错：rm -rf /home/teng/cartographer_ws/build_isolated/cartographer_ros
source ~/cartographer_ws/install_isolated/setup.bash
```

```yaml
roslaunch urdf02_gazebo demo03_env.launch
roslaunch cartographer_ros demo01.launch  不知道什么问题报错：不能启动move_base导航建图
rviz
rosrun teleop_twist_keyboard teleop_twist_keyboard.py
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746424279820-5969b4b1-715d-4147-b1e7-6baf543ba85b.png)

建图没问题，但是机器人坐标系一直闪红，![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746425016304-8ba311f8-84d8-4b06-8cf4-9e6d397666b2.png)

Map改成base_footprint坐标系,机器人坐标系不闪红，但是Map地图闪红。

```yaml
rosrun rqt_tf_tree rqt_tf_tree
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746424799363-56f6c2cb-5f17-4e88-b9d4-44a982d473fe.png)

```yaml
rm -rf /home/teng/cartographer_ws/build_isolated/cartographer_ros
catkin_make_isolated --install --use-ninja
source ~/cartographer_ws/install_isolated/setup.bash
roslaunch urdf02_gazebo demo03_env.launch
roslaunch cartographer_ros demo01_rviz.launch 把不需要的默认组件移除
rosrun teleop_twist_keyboard teleop_twist_keyboard.py
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746431454876-12201e0b-190d-4305-b6e6-33d1c9ea369a.png)



```yaml
roslaunch nav_demo nav02_map_save.launch
或 rosrun map_server map_saver
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746426387408-100548c3-bb7e-46f8-acd5-1ca365a05514.png)

```yaml
1、首先进入cartographer工作空间下，然后刷新环境变量，然后执行下面语句，完成轨迹, 停止进一步的数据
    rosservice call /finish_trajectory 0
2、将当前地图信息保存为后缀名为.pbstream
    rosservice call /write_state "{filename: '<绝对路径存放地图信息>/<地图保存的名字>.pbstream'}"
3、将后缀名为.pbstream的地图信息，转化成ros地图信息
    rosrun cartographer_ros cartographer_pbstream_to_ros_map -map_filestem=<保存地图的绝对路径>/<地图命名> -pbstream_filename=<存放pbstream地图的绝对路径>/<filename>.pbstream -resolution=0.05
```



# 阿克曼小车
[阿克曼移动机器人gazebo仿真项目开源_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1ku411r7wG/?spm_id_from=333.999.0.0&vd_source=ddf5e64a1dfd3bc5bcc336b44c063a29)

[阿克曼结构移动机器人的gazebo仿真（九）_带有velodyne模型的gazebo akerman机器人-CSDN博客](https://blog.csdn.net/qq_48427527/article/details/124571312?spm=1001.2014.3001.5502)

[https://github.com/Lord-Z/ackermann_gazebo](https://github.com/Lord-Z/ackermann_gazebo)



racebot

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746377636422-8983e454-ceb1-41ce-96e2-03ab5e4f7fd1.png)

tianracer

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746378348989-c9555d78-030c-4ff5-9fd8-32105d5a296e.png)

---

### <font style="color:rgb(31, 35, 40);">racebot建图 (racebot slam)</font>
```plain
roslaunch racebot_gazebo racebot.launch
roslaunch racebot_gazebo gmapping.launch
rosrun teleop_twist_keyboard teleop_twist_keyboard.py
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746376951992-18a634e3-a366-4630-b30e-4032a9ad96c6.png)

### <font style="color:rgb(31, 35, 40);">tianracer建图(tianracer slam)</font>
```plain
roslaunch racebot_gazebo tianracer.launch
roslaunch racebot_gazebo gmapping.launch
rosrun teleop_twist_keyboard teleop_twist_keyboard.py
```

就车模型不一样。

---

### <font style="color:rgb(31, 35, 40);">racebot导航(racebot navigation)</font>
```plain
roslaunch racebot_gazebo tianracer.launch
roslaunch racebot_gazebo navigation.launch
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746377412916-7d11644c-37f9-42fb-b20e-12d4b7ce99eb.png)

### <font style="color:rgb(31, 35, 40);">racebot一键导航(racebot one launch file to navigation)</font>
```plain
roslaunch racebot_gazebo teb_demo.launch
```

### <font style="color:rgb(31, 35, 40);">tianracer一键导航(tianracer one launch file to navigation)</font>
```plain
roslaunch racebot_gazebo tianracer_teb_demo.launch
```

一样的，只是将两个文件一起打开。

---

### <font style="color:rgb(31, 35, 40);">racebot导航建图(racebot navi&slam)</font>
```plain
roslaunch racebot_gazebo racebot.launch
roslaunch racebot_gazebo slam_navi.launch
```

### <font style="color:rgb(31, 35, 40);">tianracer导航建图(tianracer navi&slam)</font>
```plain
roslaunch racebot_gazebo tianracer.launch
roslaunch racebot_gazebo slam_navi.launch
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746378452135-dfa857cc-0ddf-44b5-8ef7-0da437a957b8.png)



# B站机器人工匠阿杰
## 初试
安装仿真环境：

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746433090112-ea9084b9-aabd-48d2-b705-1a9fcafe674c.png)![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746433396780-fe4c86ce-a2d7-47a4-a323-e483ff19d865.png)![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746433401546-5eb114c7-9835-4467-8904-6714143af3e6.png)![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746433223648-d35aaf35-7cd7-44cf-9efa-9986f89fb8f1.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746433182560-71d1d9d0-50d6-42b8-b8b7-39be1b6cd502.png)

```yaml
catkin_make
source ./devel/setup.bash
```

```yaml
roslaunch wpr_simulation wpb_stage_robocup.launch
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746433779716-05ecc9a0-fec7-471b-a89a-d6e711260911.png)

## 进阶
![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746433521923-302b8d64-8828-458c-9741-608b63ad6148.png)



# 视觉SLAM仿真
## 初试
以差速小车环境为例子，启动仿真环境，

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746437582574-ef9d688e-f465-487b-b9ad-dacde6892034.png)

```yaml
rostopic echo /camera/camera_info
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746436961887-8eeb7091-d251-4fe3-b159-7f3e8af1ffb9.png)![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746437002099-a9284e27-87da-49b7-ae20-fe03afbe173c.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746436885062-c4b0d320-e250-4dde-8d75-df79d07890b6.png)

```yaml
roslaunch urdf02_gazebo demo03_env_camera.launch
rosrun ORB_SLAM2 Mono Vocabulary/ORBvoc.txt Examples/ROS/ORB_SLAM2/Asus_r.yaml
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746435987441-d13fa88d-5d76-4cd3-9799-8a609646f843.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746435111094-a19567c2-fcfb-4df0-8b9a-ecdad958d06a.png)

可能特征点太少了。

```yaml
roslaunch urdf02_gazebo demo03_env_camera.launch
rosrun ORB_SLAM2 RGBD Vocabulary/ORBvoc.txt Examples/ROS/ORB_SLAM2/Asus_r.yaml
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746436026923-b10dcb65-ac2f-4bb2-9032-d5c3dd0b1e65.png)![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746437935746-f7faf735-b854-40b1-bba1-5338d448e6ca.png)![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746438147771-8bf6b034-3124-4303-a6a3-6738db8b6ee0.png)

估计就是特征点太少了。

---

换个世界环境，使用赵老师的box_house.world，该墙壁具有纹理特征，特征点比较多，

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746439577527-7cd8b282-8f26-4413-a940-65a30aa7421c.png)



---

再换个world环境，[gazebo+ORB-SLAM仿真教程_把lvisam运用到gazebo-CSDN博客](https://blog.csdn.net/qinqinxiansheng/article/details/115266992)

```yaml
rosrun image_view image_view image:=/camera/depth/image_raw
rosrun image_view image_view image:=/camera/rgb/image_raw
```

只加载world会打不开，直接拷贝这个仿真功能包，

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746442099231-ea810799-84f9-4fa2-a220-a77065c09563.png)

可能报错，将xacro.py改成xacro，

```yaml
catkin_make
roslaunch robot_sim_demo robot_spawn.launch
```

可能报错，因为这个仿真环境用到`yocs_cmd_vel_mux` ROS 包，主要用于多路复用（mux）多个速度指令（`cmd_vel`）源。它的核心功能是根据优先级选择并发布一个最终的速度指令，供机器人底盘或运动控制器使用。

```yaml
sudo apt-get update
sudo apt-get install ros-noetic-yocs-cmd-vel-mux
```

... ... 

可能包含很多皮肤，因此ROS-Academy.world和small-house.world一样单纯加载world有问题。

---

## 进阶
[ubuntu 16.04+ros kinetic + gazebo+ aws-robotics 室内环境导航仿真-阿里云开发者社区](https://developer.aliyun.com/article/1292872)

[GitHub - aws-robotics/aws-robomaker-small-house-world: A house world with multiple rooms and furniture for AWS RoboMaker and Gazebo simulations.](https://github.com/aws-robotics/aws-robomaker-small-house-world)

```yaml
cd nav_ws/src
git clone https://github.com/aws-robotics/aws-robomaker-small-house-world
```

```yaml
catkin_make
source ./devel/setup.bash
roslaunch aws_robomaker_small_house_world view_small_house.launch
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746445583954-4f4d2669-0c7d-4bc3-a983-12be03fa8181.png)



```yaml
<launch>
    <param name="robot_description" command="$(find xacro)/xacro $(find urdf02_gazebo)/urdf/car_camera.urdf.xacro"/>

    <include file="$(find gazebo_ros)/launch/empty_world.launch">
        <!-- <arg name="world_name" value="$(find urdf02_gazebo)/gazebo_models/worlds/house2.world" /> -->
        <!-- <arg name="world_name" value="$(find urdf02_gazebo)/gazebo_models/worlds/box_house.world" /> -->
        <!-- <arg name="world_name" value="$(find aws-robomaker-small-house-world)/worlds/small_house.world" /> -->
        <arg name="world_name" value="/home/teng/Dy_Nav/Gazebo_env/nav_ws/src/aws-robomaker-small-house-world/worlds/small_house.world" />
    </include>

    <node name="car" pkg="gazebo_ros" type="spawn_model" args="-urdf -model car -param robot_description"/>


    <node name="joint_state_publisher" pkg="joint_state_publisher" type="joint_state_publisher"/>

    <node name="robot_state_publisher" pkg="robot_state_publisher" type="robot_state_publisher" output="screen">
        <param name="publish_frequency" type="double" value="50.0" />
    </node>
</launch>
```

可能找不到aws-robomaker-small-house-world包，需要使用绝对路径。

```yaml
roslaunch urdf02_gazebo demo03_env_camera.launch
rosrun ORB_SLAM2 RGBD Vocabulary/ORBvoc.txt Examples/ROS/ORB_SLAM2/Asus_r.yaml
rosrun teleop_twist_keyboard teleop_twist_keyboard.py
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746450330725-541710c5-dfa5-4338-bf50-3c86c19572f2.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746450558073-4e46cc89-3257-46e7-b31f-9c137b0d465c.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746451874665-c037f002-3b45-45fd-86e0-01a732d64dfe.png)

<font style="color:#DF2A3F;">ORB-SLAM 在某个时刻未识别到特征点后，下一时刻停止识别的问题！</font>

可能原因：

（1）地图初始化失败‌：在系统初始化阶段，如果无法检测到足够的特征点或无法建立初始地图，ORB-SLAM 会停止工作。

（2）特征点数量不足或质量差‌：场景特征不丰富（如纯白色墙壁、光滑表面等），导致 ORB 特征提取算法无法检测到足够的特征点。

（3）跟踪丢失（Tracking Lost）：当连续帧之间无法匹配足够的特征点时，ORB-SLAM 会认为跟踪丢失，从而停止识别。



## 新地图
自建：post_office_play.world

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1747231263018-af4ec084-1ccc-4187-820d-eac209f96571.png)

地图：apartment.world

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1747398798677-fcea8d84-238b-47eb-a482-b24f30fab3ff.png)



```yaml
roslaunch urdf02_gazebo demo03_env_camera.launch
rosrun ORB_SLAM2 RGBD Vocabulary/ORBvoc.txt Examples/ROS/ORB_SLAM2/Asus_r.yaml
rosrun teleop_twist_keyboard teleop_twist_keyboard.py
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1747401799875-84ef1c4d-163e-4dcc-8c2d-420345e3ae8c.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1747401727586-40337676-3825-4dd5-81b4-cc50a8067959.png)![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1747401767951-df3eb3ec-1387-46a8-b911-2a903fe5dfc0.png)

<font style="color:#DF2A3F;">这次地图特征点多，走的很远，但是后续还是一没识别到特征点算法就中断！</font>

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1747402262273-ca20b8b1-bbec-4aa7-a650-2f86efb5c253.png)

```yaml
[pcl::VoxelGrid::applyFilter] Leaf size is too small for the input dataset. Integer indices would overflow.show global map, size=1701560
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1747451321195-7ecb4a8a-46b3-4083-bdda-5af294e3caea.png)

---

```yaml
pcl_viewer vslam_final.pcd
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1747402385865-9bd8f429-bbf9-49f4-a9d4-03038b93fee9.png)

```yaml
roslaunch publish_pointcloud demo.launch
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1747402796771-ac52d0a0-4b87-4461-9fb3-d121ca153af6.png)

<font style="color:#DF2A3F;">改坐标系为camera(要保持一致）</font>，

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1747404725723-545ae21c-8d66-4849-8f88-cb176b1e6150.png)

<font style="color:#DF2A3F;">很明显不对，地面变成了障碍，而且发现点云与栅格平面的距离不均匀，呈现越来越大的趋势，不知道什么原因</font>。







# <font style="color:rgb(34, 34, 38);">深度图像转激光数据</font>
[7.3.8 深度图像转激光数据_深度相机转多线激光雷达-CSDN博客](https://blog.csdn.net/qq_22701545/article/details/115743013)

[深度图转2D激光扫描技术详解-CSDN博客](https://blog.csdn.net/weixin_42990464/article/details/136940853)

```yaml
sudo apt-get install ros-noetic-depthimage-to-laserscan
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746506899883-9761b57c-3c1c-4392-b0a5-3816e8165081.png)

```yaml
<launch>
    <node pkg="depthimage_to_laserscan" type="depthimage_to_laserscan" name="depthimage_to_laserscan" ns="i2l">
        <remap from="image" to="/camera/depth/image_raw" />
        <param name="output_frame_id" value="camera"  />
    </node>
</launch>
```

```yaml
<!--
	Sample launch file for depthimage_to_laserscan
	As of September 2nd 2021.
-->

<launch>

  <!-- Depth Image to Laser Scan Node -->
  <node name="depthimage_to_laserscan" pkg="depthimage_to_laserscan" type="depthimage_to_laserscan" args="">

    <remap from="image"       to="/camera/depth/image_rect_raw"/> <!-- change here for your camera depth topic name. Default: "/camera/depth/image_raw" -->

    <remap from="camera_info" to="/camera/color/camera_info"/> 
    <!-- the remap for camera_info by default uses the same path as the one given to the image topic. Default: "<path_to_image_topic>/camera_info>" -->

    <!-- PARAMETERS: -->
    <!-- These are the default values. --> 
    <param name="scan_height"     type="int"    value="1"/> <!-- default: 1 pixel. Number of pixel rows used to generate laser scan. -->
    <param name="scan_time"       type="double" value="0.033"/> <!-- default:0.033, 30 FPS . Time between scans. -->
    <param name="range_min"       type="double" value="0.4"/> <!--default:0.45m. Ranges less than this are considered -Inf. -->
    <param name="range_max"       type="double" value="10.0"/> <!--default: 10m. Ranges less than this are considered +Inf. -->
    <param name="output_frame_id" type="str"    value="camera_depth_frame"/> <!--default: camera_depth_frame. Frame id of the laser scan. -->
	
  </node>
	
</launch>
```

```yaml
roslaunch urdf02_gazebo demo05_image2laser.launch
```

# Velodyne Simulator 插件
[Velodyne Simulator 开源项目教程-CSDN博客](https://blog.csdn.net/gitblog_01106/article/details/142839370)

[GitHub - lmark1/velodyne_simulator: URDF description and Gazebo plugins to simulate Velodyne laser scanners - fork from BitBucket: https://bitbucket.org/DataspeedInc/velodyne_simulator](https://github.com/lmark1/velodyne_simulator)

[GitCode - 全球开发者的开源社区,开源代码托管平台](https://gitcode.com/gh_mirrors/ve/velodyne_simulator/)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746500723450-22267176-6c29-4ebd-80d5-d3658e212fff.png)

## 仿真环境
编译项目

```yaml
git clone https://github.com/lmark1/velodyne_simulator.git 或
git clone https://gitcode.com/gh_mirrors/ve/velodyne_simulator.git

cd ackerman_ws
catkin_make
source devel/setup.bash
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746500224480-5efa7c52-6674-4cc2-aeb9-244e2fa74d20.png)

启动一个包含 Velodyne 激光扫描仪的 Gazebo 仿真环境

```yaml
roslaunch velodyne_description example.launch
roslaunch velodyne_description example.launch gpu:=true  启用GPU加速
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746500606653-6f54843b-4192-43f2-b00f-0f8b26a836dc.png)



把racer.xacro复制一个命名racer_VLP16.xacro,并将VLP16雷达加入到我们的小车模型xacro参数文件，![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746504063876-bdb06959-54bd-4960-a50f-bb657f1b3865.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746503756113-64c6d1f7-4138-4531-9e5a-cbf9c35caabc.png)![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746503837064-ffa9ee75-609d-48ef-9db4-25520816297a.png)

```yaml
  <xacro:include filename="$(find racebot_description)/urdf/ackermann/racecar.gazebo" />

  <xacro:arg name="gpu" default="false"/>
  <xacro:property name="gpu" value="$(arg gpu)" />
  
  <xacro:include filename="$(find velodyne_description)/urdf/VLP-16.urdf.xacro"/>
  <xacro:VLP-16 parent="base_link" name="velodyne" topic="/velodyne_points" hz="10" samples="440" gpu="${gpu}">
    <origin xyz="0 0 0.4" rpy="0 0 0" />
  </xacro:VLP-16>

  <xacro:include filename="$(find velodyne_description)/urdf/HDL-32E.urdf.xacro"/>
  <xacro:HDL-32E parent="base_link" name="velodyne2" topic="/velodyne_points2" hz="10" samples="220" gpu="${gpu}">
    <origin xyz="0 0 0.6" rpy="0 0 0" />
  </xacro:HDL-32E>
```

```yaml
roslaunch racebot_gazebo racebot_VLP16.launch
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746503928333-370c2c03-54e1-4b6c-b179-c5c7d67592ba.png)



把原有的二维雷达和HDL-32E雷达注释掉，并调整一下VLP16的位置，

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746504291406-5cbe28fb-5cf6-49f3-b064-e25fec9c0fbf.png)![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746504483232-715d2157-cf8a-4b1f-817d-e9a925b9b288.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746504556524-eab87318-502f-4ec3-86f5-b6dcf4b31b66.png)

调整z轴的位置，从0.4米调整为0.1米，

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746504755627-0ccb6567-12b0-468c-8ec2-1291ea55ec75.png)



---

[小车算法验证仿真平台](https://t11n5ozh20.feishu.cn/docx/OxBRdgrJronAz4xX7yUc6j8unCc)  该代码没开放下载

## 2d地图构建八叉树地图
```yaml
sudo apt-get install ros-noetic-octomap-ros
sudo apt-get install ros-noetic-octomap-msgs
sudo apt-get install ros-noetic-octomap-server
sudo apt-get install ros-noetic-octomap-rviz-plugins
```

新建两个launch文件，

```yaml
sudo apt-get install ros-noetic-pointcloud-to-laserscan
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746518940489-cd76be41-737a-4799-ae73-db84777d3f6e.png)

```yaml
<launch>
    <!-- transform pointCloud2 to laserScan -->
    <node pkg="pointcloud_to_laserscan" type="pointcloud_to_laserscan_node" name="face_pointcloud_to_laserscan" 
        respawn="false" output="screen">
        <remap from="cloud_in" to="/velodyne_points"/>
        <rosparam>
            transform_tolerance: 0.01
            min_height: 0.0
            max_height: 1.0

            angle_min: -3.14159
            angle_max: 3.14159
            angle_increment: 0.0175
            scan_time: 0.3333
            range_min: 0.05
            range_max: 25
            use_inf: true

            # Concurrency level, affects number of pointclouds queued for processing and number of threads used
            # 0 : Detect number of cores
            # 1 : Single threaded
            # 2->inf : Parallelism level
            concurrency_level: 1
        </rosparam>
        <!-- <rosparam file="$(find unitree_move_base)/config/pointCloud_to_laserScan_params.yaml" command="load" /> -->
    </node>
</launch>
```

```yaml
<launch>
  <node pkg="octomap_server" type="octomap_server_node" name="octomap_server">

    <!-- resolution in meters per pixel -->
    <param name="resolution" value="0.1" />

    <!-- name of the fixed frame, needs to be "/map" for SLAM -->
    <param name="frame_id" type="string" value="map" />

    <!-- max range / depth resolution of the kinect in meter -->
    <param name="sensor_model/max_range" value="1000.0" />
    <param name="latch" value="true" />

    <!-- max/min height for occupancy map, should be in meters -->
    <param name="pointcloud_max_z" value="3" />
    <param name="pointcloud_min_z" value="0" />

    <!-- topic from where pointcloud2 messages are subscribed -->
    <remap from="/cloud_in" to="/velodyne_points" />
 
  </node>
  <!-- 发布一个雷达body到机器人足端body_foot的静态映射 -->
  <!--<node pkg="tf2_ros" type="static_transform_publisher" name="tf_pub_1" args="-0.10 -0.11 0 0 0 0 base_link base_footprint" />-->
  <!-- 发布一个雷达初始位置camera_init到base的静态映射 -->
  <!--<node pkg="tf2_ros" type="static_transform_publisher" name="tf_pub_2" args="0 0 0 0 0 0 camera_init odom" />-->
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746505175398-3a86abe9-761e-4576-ad11-50090ee1508e.png)

### 三维激光雷达
```yaml
roslaunch racebot_gazebo racebot_VLP16.launch  三维激光雷达
roslaunch racebot_gazebo gmapping.launch
rosrun teleop_twist_keyboard teleop_twist_keyboard.py
roslaunch racebot_gazebo octomaptransform.launch

#保存八叉树地图
rosrun octomap_server octomap_saver -f octomap.bt
#保存2d地图
rosrun map_server map_saver map:=/projected_map -f 2d
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746507380124-35f67d7a-5ae2-4b5c-9a2e-295b902fb308.png)![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746507855453-f8a5fea9-28ee-4840-812c-ca613eb28564.png)![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746508161694-86e5549e-5808-4cf2-9171-41a904bc94cd.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746508395692-7e68b063-a005-422f-ad2c-39a148f36b85.png)![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746508243281-008db066-f2b7-456a-aa16-1eadfa263bca.png)![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746508271362-abdcb196-3d41-4bcc-9d7a-afcbd3034d2a.png)![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746508304504-1f61e72c-35c7-4ad5-aa31-cef931b5e24f.png)

建图有圈，怀疑是把地面给建了，需要过滤一下地面。

---

```yaml
roslaunch racebot_gazebo pointCloud2LaserScan.launch
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746519103248-d18594f9-4f82-4c18-b342-8e95bca1edfe.png)

```yaml
rosrun map_server map_saver map:=/map -f 2d
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746519886751-43787905-d590-4fdd-b03f-8b81a7f21168.png)

```yaml
roslaunch racebot_gazebo octomaptransform.launch
rosrun map_server map_saver map:=/projected_map -f 2d
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746520193249-0640a03f-2c51-4a90-bc96-7ab3ed9aec13.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746520148382-5fcad45e-9a0a-4f4e-a0c8-7cda428053a4.png)





### 二维激光雷达
```yaml
roslaunch racebot_gazebo racebot.launch  二维激光雷达
roslaunch racebot_gazebo gmapping.launch
rosrun teleop_twist_keyboard teleop_twist_keyboard.py
roslaunch racebot_gazebo octomaptransform.launch

#保存2d地图
rosrun map_server map_saver map:=/projected_map -f 2d
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746509009011-fe56b404-8ec0-4b0a-a553-3b8c81c69b36.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746509402086-de0b450a-4db6-4e47-99da-5b191a0f1373.png)

注释xacro中的激光雷达，使用深度图像转激光数据进行建图，

```yaml
<launch>
    <node pkg="depthimage_to_laserscan" type="depthimage_to_laserscan" name="depthimage_to_laserscan" ns="i2l">
        <!-- <remap from="image" to="/camera/depth/image_raw" />
        <param name="output_frame_id" value="camera"  /> -->

         <remap from="image" to="/real_sense/depth/image_raw" />
        <param name="output_frame_id" value="real_sense"  />
    </node>
</launch>
```

```yaml
roslaunch racebot_gazebo depthimage_to_laserscan.launch
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746513035284-497f7d54-8509-4c93-a161-629fdd91689c.png)

运行了gmapping建图，不知道为啥栅格地图不显示,

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746514924532-51bd13e8-606d-489f-8667-be046bd0b1dd.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746515388946-bb5fb052-3efc-4b79-b656-08f512625707.png)

**<font style="color:#DF2A3F;">不要给/scan消息重新命名就可以接收到/map，最后收/scan而不是/i2l/scan</font>**

```yaml
<!--
	Sample launch file for depthimage_to_laserscan
	As of September 2nd 2021.
-->

<launch>

  <!-- Depth Image to Laser Scan Node -->
  <node name="depthimage_to_laserscan" pkg="depthimage_to_laserscan" type="depthimage_to_laserscan" args="">

    <remap from="image"       to="/real_sense/depth/image_raw"/> <!-- change here for your camera depth topic name. Default: "/camera/depth/image_raw" -->

    <remap from="camera_info" to="/camera/color/camera_info"/> 
    <!-- the remap for camera_info by default uses the same path as the one given to the image topic. Default: "<path_to_image_topic>/camera_info>" -->

    <!-- PARAMETERS: -->
    <!-- These are the default values. --> 
    <param name="scan_height"     type="int"    value="1"/> <!-- default: 1 pixel. Number of pixel rows used to generate laser scan. -->
    <param name="scan_time"       type="double" value="0.033"/> <!-- default:0.033, 30 FPS . Time between scans. -->
    <param name="range_min"       type="double" value="0.4"/> <!--default:0.45m. Ranges less than this are considered -Inf. -->
    <param name="range_max"       type="double" value="10.0"/> <!--default: 10m. Ranges less than this are considered +Inf. -->
    <param name="output_frame_id" type="str"    value="real_sense"/> <!--default: camera_depth_frame. Frame id of the laser scan. -->
	
  </node>
	
</launch>

<!-- <remap from="image" to="/camera/depth/image_raw" />
        <param name="output_frame_id" value="camera"  /> -->
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746517503481-b5a7c3ef-9ab7-4609-9780-7b21eeefde6a.png)

## 3d地图构建八叉树地图
可使用cartographer, fast-lio等3D建图方法，

```yaml
<launch>
  <node pkg="octomap_server" type="octomap_server_node" name="octomap_server">

    <!-- resolution in meters per pixel -->
    <param name="resolution" value="0.1" />

    <!-- name of the fixed frame, needs to be "/map" for SLAM -->
    <param name="frame_id" type="string" value="odom" />

    <!-- max range / depth resolution of the kinect in meter -->
    <param name="sensor_model/max_range" value="1000.0" />
    <param name="latch" value="true" />

    <!-- max/min height for occupancy map, should be in meters -->
    <param name="pointcloud_max_z" value="3" />
    <param name="pointcloud_min_z" value="0" />

    <!-- topic from where pointcloud2 messages are subscribed -->
    <remap from="/cloud_in" to="/velodyne_points" />
 
  </node>
  <!-- 发布一个雷达body到机器人足端body_foot的静态映射 -->
  <!--<node pkg="tf2_ros" type="static_transform_publisher" name="tf_pub_1" args="-0.10 -0.11 0 0 0 0 base_link base_footprint" />-->
  <!-- 发布一个雷达初始位置camera_init到odom的静态映射 -->
  <node pkg="tf2_ros" type="static_transform_publisher" name="tf_pub_2" args="0 0 0 0 0 0 camera_init odom" />
```



---

其他参考：

[手把手教你Velodyne Lidar仿真+3D建图](https://zhuanlan.zhihu.com/p/395515892)

[GitHub - COONEO/neor_mini: ROS-based Ackerman-like unmanned car.](https://github.com/COONEO/neor_mini)



# 宇树机械狗go2
[古月居 - ROS机器人知识分享社区](https://www.guyuehome.com/detail?id=1880175119840628737)

[宇树机器狗go2—路径规划](https://t11n5ozh20.feishu.cn/docx/V7lddCvm0oVF0ixvqqJcEPoDnze)

[GitHub - davidakhihiero/FAST_LIO_LOCALIZATION-ROS-NOETIC: A simple localization framework that can re-localize in built maps based on FAST-LIO. This fork works with ROS Noetic (and Python3)](https://github.com/davidakhihiero/FAST_LIO_LOCALIZATION-ROS-NOETIC)

[GitHub - SteveMacenski/slam_toolbox at noetic-devel](https://github.com/SteveMacenski/slam_toolbox/tree/noetic-devel)

## go2仿真环境




## Fast_LIO建图












