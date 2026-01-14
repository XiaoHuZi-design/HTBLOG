---
title: "ORB-SLAM3的ROS编译（ubantu20.04）"
date: 2026-01-15
tags: ["ROS", "机器人", "SLAM"]
---

---

[基于orbslam3的rgbd三维重建(ros版)_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1nb411o7jm/?vd_source=9741da01eb5597a19fd0610df71471cc)

[https://github.com/lturing/ORB_SLAM3_ROS/issues](https://github.com/lturing/ORB_SLAM3_ROS/issues)

ubuntu20.04 从头开始配置orbslam3和ros1 noetic 并且使用d455跑代码(3):  
[https://blog.csdn.net/2303_79224782/article/details/146051737](https://blog.csdn.net/2303_79224782/article/details/146051737)  
[https://github.com/emanuelenencioni/ORB_SLAM3_ROS](https://github.com/emanuelenencioni/ORB_SLAM3_ROS)

ORB-SLAM3  ROS版本 在ubantu20.04 编译会报错，需要更改:  
[https://blog.csdn.net/qq_39537898/article/details/124775247](https://blog.csdn.net/qq_39537898/article/details/124775247)  
[https://github.com/UZ-SLAMLab/ORB_SLAM3/issues/442](https://github.com/UZ-SLAMLab/ORB_SLAM3/issues/442)  
[https://github.com/Kin-Zhang/ORB_SLAM3/tree/feat/20.04](https://github.com/Kin-Zhang/ORB_SLAM3/tree/feat/20.04)

---

<font style="color:#DF2A3F;">会出现rosbuild_init等报错...</font>

<font style="color:rgb(78, 161, 219) !important;">ubuntu</font><font style="color:rgb(77, 77, 77);"> 20.04 需要进行一些修改，具体怎么改还不清楚。</font>

---

## 绪零、原ORB-SLAM3新建ROS工作空间(单目可用）
[https://github.com/UZ-SLAMLab/ORB_SLAM3](https://github.com/UZ-SLAMLab/ORB_SLAM3/issues/442)

参考：[ubuntu20.04通过ros-noetic配置ORBslam3-CSDN博客](https://blog.csdn.net/xs798465/article/details/135070426)

```yaml
orbslam3的ros部分源码只在ubuntu18.04上运行,所以我们要重新用ros-noetic创建新的工作空间
https://blog.csdn.net/xs798465/article/details/135070426

(1)创造工作空间
cd ORB_SLAM3
mkdir -p ros/src
cd ros
catkin_make
(2)生成功能包
cd src/
catkin_create_pkg orbslam3 roscpp cv_bridge
(3)将orbslam的ros的源码复制粘贴过来

---
roscore
---
# terminal two
cd ros
source /devel/setup.bash
rosrun orbslam3 orbslam3_node ../Vocabulary/ORBvoc.txt ../Examples/Monocular/EuRoC.yaml


roslaunch YOLO_ORB_SLAM3_with_pointcloud_map camera_topic_remap.launch

roslaunch orbslam3 camera_topic_remap.launch
rosrun orbslam3 RGBD ../Vocabulary/ORBvoc.txt ../Examples/RGB-D/TUM2.yaml

rosrun orbslam3 Stereo_Inertial ../Vocabulary/ORBvoc.txt ../Examples/Stereo-Inertial/EuRoC.yaml true
rosbag play --pause MH_01_easy.bag /cam0/image_raw:=/camera/left/image_raw /cam1/image_raw:=/camera/right/image_raw /imu0:=/imu


/cam0/image_raw:=/camera/left/image_raw：这表示将bag文件中/cam0/image_raw话题的数据重新映射并发布到/camera/left/image_raw话题上。

/cam1/image_raw:=/camera/right/image_raw：这表示将bag文件中/cam1/image_raw话题的数据重新映射并发布到/camera/right/image_raw话题上。

/imu0:=/imu：这表示将bag文件中/imu0话题的数据重新映射并发布到/imu话题上。

```

```yaml
cmake_minimum_required(VERSION 3.0.2)
 
project(orbslam3)
 
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS}  -Wall  -O3")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall  -O3")
## set path
set(ORBSLAM_PATH "/home/teng/dynamic_slam/ORB_SLAM3")
 
include(CheckCXXCompilerFlag)
CHECK_CXX_COMPILER_FLAG("-std=c++11" COMPILER_SUPPORTS_CXX11)
if(COMPILER_SUPPORTS_CXX11)
   set(CMAKE_CXX_STANDARD 14)
   add_definitions(-DCOMPILEDWITHC11)
   message(STATUS "Using flag -std=c++11.")
elseif(COMPILER_SUPPORTS_CXX0X)
   set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++0x")
   add_definitions(-DCOMPILEDWITHC0X)
   message(STATUS "Using flag -std=c++0x.")
else()
   message(FATAL_ERROR "The compiler ${CMAKE_CXX_COMPILER} has no C++11 support. Please use a different C++ compiler.")
endif()
 
#LIST(APPEND CMAKE_MODULE_PATH ${PROJECT_SOURCE_DIR}//home/teng/dynamic_slam/ORB_SLAM3/cmake_modules)
LIST(APPEND CMAKE_MODULE_PATH ${ORBSLAM_PATH}/cmake_modules)
 
find_package(OpenCV)
if(NOT OpenCV_FOUND)
   find_package(OpenCV 2.4.3 QUIET)
   if(NOT OpenCV_FOUND)
      message(FATAL_ERROR "OpenCV > 2.4.3 not found.")
   endif()
endif()
 
 
 
find_package(Eigen3 REQUIRED)
find_package(Pangolin REQUIRED)
find_package(catkin REQUIRED COMPONENTS
  cv_bridge
  roscpp
)
 
 
catkin_package(
#  INCLUDE_DIRS include
#  LIBRARIES orbslam3
 CATKIN_DEPENDS cv_bridge roscpp
#  DEPENDS system_lib
)
 
## include
include_directories(
   ${catkin_INCLUDE_DIRS}
   ${OpenCV_INCLUDE_DIRS}
   ${EIGEN3_INCLUDE_DIRS}
   ${Pangolin_INCLUDE_DIRS}
   ${PROJECT_SOURCE_DIR}
   ${ORBSLAM_PATH}
   ${ORBSLAM_PATH}/include
   ${ORBSLAM_PATH}/include/CameraModels
   ${ORBSLAM_PATH}/Thirdparty/Sophus
   ${Pangolin_INCLUDE_DIRS}
   ${catkin_INCLUDE_DIRS}
)
 
 
## libs
set(LIBS 
${OpenCV_LIBS} 
${EIGEN3_LIBS}
${Pangolin_LIBRARIES}
${ORBSLAM_PATH}/Thirdparty/DBoW2/lib/libDBoW2.so
${ORBSLAM_PATH}/Thirdparty/g2o/lib/libg2o.so
${ORBSLAM_PATH}/lib/libORB_SLAM3.so
-lboost_system
)
 
 
add_executable(${PROJECT_NAME}_node src/src/ros_mono.cc)
#add_executable(${PROJECT_NAME}_node src/src/ros_rgbd.cc)  
#add_executable(${PROJECT_NAME}_node src/src/ros_stereo.cc) 
 
target_link_libraries(${PROJECT_NAME}_node
  ${catkin_LIBRARIES}
  ${LIBS}
)
 
```

<font style="color:#DF2A3F;">单目编译成功，</font>

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1745997886104-6212762c-b6a5-4206-8f44-1c954ba01e4d.png)![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1745998093021-2c7a7b07-256b-4672-89ea-3e5cd7017b18.png)

由于没有传入图片信息，画面什么也没有。单目图像话题 `/camera/image_raw` ,

我用仿真环境发布了`/camera/image_raw` ,但是还是没有画面，另外将EUROC数据集发布话题重映射到这个话题也没有画面。

<font style="color:#DF2A3F;">双目和RGBD编译失败，报错相同，</font>

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1745998708751-21945da1-575f-4d0e-be7a-d403bfc99cd8.png)

## 绪一、更新（rosdep update后）
之前rosbulid_init报是rosdep update不能运行的问题，现在修复好了。

[Ubuntu20.04的ROS环境安装ORB-SLAM3详解_树莓派ubuntu20.04运行orbslam3与ros-CSDN博客](https://blog.csdn.net/Prototype___/article/details/129286042)



## 一、ORB_SLAM3_ROS（B站）稠密点云
[基于orbslam3的rgbd三维重建(ros版)_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1nb411o7jm/?vd_source=9741da01eb5597a19fd0610df71471cc)

[https://github.com/lturing/ORB_SLAM3_ROS/issues](https://github.com/lturing/ORB_SLAM3_ROS/issues)

```yaml
chmod +x ./build.sh 
./build.sh 
```

报错修改：

改指针类型，

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1745898319525-ef8afc05-76e1-4bbf-92c1-243cd169b18b.png)

改数据集地址，

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1745898528511-ed840383-26df-4be7-ac2d-8db28e607607.png)

添加保存点云地图：

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1745898385069-79c307e3-93f7-4ae1-a526-a3bdf3e7ef8c.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1745898419740-48987151-a0f8-4a88-beff-94f4e9232bb0.png)



```yaml
# 运行单目
# 适当修改 launch/orb_slam_mono.launch
chmod +x ./run_mono.sh
./run_mono.sh 

# 运行双目
# 适当修改 launch/orb_slam_stereo.launch
chmod +x ./run_stereo.sh 
./run_stereo.sh 

# 运行rgbd稠密建图
# 适当修改 launch/orb_slam_rgbd_mapping.launch
chmod +x ./run_rgbd_mapping.sh 
./run_rgbd_mapping.sh 
```

这里我们运行RGBD稠密建图，

```yaml
[orb_slam3-3] process has died [pid 15536, exit code -11, cmd /home/teng/Dy_Nav/ORB_SLAM3_ROS/Examples/ROS/ros_rgbd_mapping /home/teng/Dy_Nav/ORB_SLAM3_ROS/Examples/RGB-D/TUM3_or.yaml /home/teng/Dy_Nav/ORB_SLAM3_ROS/Vocabulary/ORBvoc.txt /home/teng/dynamic_slam/ORB_SLAM3/Datasets/TUM/rgbd_dataset_freiburg3_walking_xyz __name:=orb_slam3 __log:=/home/teng/.ros/log/bcdd5e08-24c5-11f0-bdaf-23573644f616/orb_slam3-3.log].
log file: /home/teng/.ros/log/bcdd5e08-24c5-11f0-bdaf-23573644f616/orb_slam3-3*.log

```

不知道啥子原因，昨天还好的，为用的fr3数据集，TUM3.yaml，但是改成TUM2.yaml就运行成功。

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1745908931828-9b9e7a4b-e41a-4aeb-92a6-6fa2bbfe5175.png)

```yaml
pcl_viewer map.pcb
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1745909015097-802fcad1-b207-480a-9c57-edc30823ecc5.png)

根据作者修改：[https://github.com/lturing/ORB_SLAM3_ROS/issues/7](https://github.com/lturing/ORB_SLAM3_ROS/issues/7)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1745910460418-7b36c1cf-1aef-44e6-aaa1-a572b8ab7738.png)

运行成功，

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1745911061624-12accefb-6274-4212-afb2-d6a9fc1d6399.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1745911154039-f6a0dddf-ef3b-457a-a1bd-860f4f6ef30b.png)

<font style="color:rgb(31, 35, 40);">KeyFrameTrajectory.txt没有保存 : </font>[https://github.com/lturing/ORB_SLAM3_ROS/issues/12](https://github.com/lturing/ORB_SLAM3_ROS/issues/12)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1745911501647-c412e574-e394-4796-ae29-1fbfadcee883.png)![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1745911837962-58860845-c834-4095-be8b-2e5d8b2a3e61.png)![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1745911942603-dee85a6c-3474-47cf-8d11-c9c06cf6f67d.png)

再编译运行，

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1745912106808-f7fb11f4-c896-49ce-9b77-0b60c580075f.png)![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1745912155283-a74bf1ae-7912-40a3-b373-7e206e51e91a.png)



```yaml
roslaunch realsense2_camera rs_camera_480.launch
rqt_image_view
```

```yaml
source ./build/devel/setup.bash
roslaunch orb_slam3 d455_mapping.launch
```

自己写了个d455_mapping.launch没搞好.



## 二、ORB_SLAM3_ROS（V1.0）稀疏点云
[https://github.com/emanuelenencioni/ORB_SLAM3_ROS](https://github.com/emanuelenencioni/ORB_SLAM3_ROS)

```yaml
./build.sh
cd ~/catkin_ws/
catkin build
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1745915163816-6ccd5fc2-113e-4f22-ad4c-c7c8af49475a.png)

```yaml
teng@teng-JiguangPro:~/Dy_Nav/orb3_ws$ roslaunch orb_slam3_ros 
d455_360p.launch           euroc_mono.launch          live_t265.launch           stereo_kitti_04_12.launch  zed2i_imu.launch
d455.launch                euroc_stereoimu.launch     stereo_kitti_00_02.launch  tum_rgbd.launch            zed2i.launch
euroc_monoimu.launch       euroc_stereo.launch        stereo_kitti_03.launch     zed2i_from_images.launch   zed2i_rosbag.launch
teng@teng-JiguangPro:~/Dy_Nav/orb3_ws$ roslaunch orb_slam3_ros 
```

```yaml
roslaunch orb_slam3_ros euroc_monoimu.launch
rosbag play MH_01_easy.bag
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1745915667351-dff005e0-c17e-4f1e-b129-1f4a4e342164.png)



```yaml
roslaunch realsense2_camera rs_camera_480.launch
rqt_image_view
```

```yaml
roslaunch orb_slam3_ros d455.launch 
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746280264183-54c0e547-60f3-43b3-a772-eed55cc196fe.png)

```yaml
rviz
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746281266726-68be390e-6d37-4da1-892a-d0b5f66df9b7.png)



参考：[https://github.com/thien94/orb_slam3_ros_wrapper](https://github.com/thien94/orb_slam3_ros_wrapper)

 	sudo apt install ros-noetic-hector-trajectory-server

---

[ubuntu20.04 从头开始配置orbslam3和ros1 noetic 并且使用d455跑代码(3)_orbslam3 ros-CSDN博客](https://blog.csdn.net/2303_79224782/article/details/146051737)









## 三、ORB_SLAM3-feat-20.04
[https://github.com/UZ-SLAMLab/ORB_SLAM3/issues/442](https://github.com/UZ-SLAMLab/ORB_SLAM3/issues/442)  
[https://github.com/Kin-Zhang/ORB_SLAM3/tree/feat/20.04](https://github.com/Kin-Zhang/ORB_SLAM3/tree/feat/20.04)

























## 




