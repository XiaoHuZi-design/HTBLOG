---
title: "ORB-SLAM2_ORB-SLAM3_数据集_相机_稠密地图_八叉树地图"
date: 2026-01-15
tags: ["ROS", "机器人", "SLAM"]
---

## 一、ORBSLAM3_Dense（无ROS）
<font style="color:rgb(31, 35, 40);">ORBSLAM3_Dense 是一个支持深度相机、双目相机稠密重建的SLam二次开发项目，并且对于针孔相机和鱼眼相机传感器类型也是支持稠密重建。该项目不仅使用了PCL建立三维稠密点云图，还在双目没有提供视差图时采用了ELas算法计算双目视差图，以达到快速开始使用的目的。</font>

详解：[https://zhuanlan.zhihu.com/p/694281711](https://zhuanlan.zhihu.com/p/694281711)

代码：[https://github.com/5p6/ORBSLAM3_Dense](https://github.com/5p6/ORBSLAM3_Dense)

```yaml
sh build.sh
```

报错修改：

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1745897402452-ad3552a0-1838-4b30-a180-9fd2d74fb2af.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1745897410711-be0bab5e-6b2b-4d92-9023-0787fc79fcc4.png)

准备好自己的数据集，

```yaml
./MyExample/rgbd_slam -r /home/teng/dynamic_slam/ORB_SLAM3/Datasets/TUM/rgbd_dataset_freiburg3_walking_xyz
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1745897699819-48cc6f4a-0f2f-4aba-864c-b4dec8b54365.png)



没有实现Ros部分。

## 二、ORB_SLAM3_detailed_comments-dense_map_new（可回环）
[ORB-SLAM 2+3 rgbd稠密地图 （地图可回环）_orbslam3稠密建图-CSDN博客](https://blog.csdn.net/l741299292/article/details/81984649)

[https://github.com/electech6/ORB_SLAM3_detailed_comments/tree/dense_map_new](https://github.com/electech6/ORB_SLAM3_detailed_comments/tree/dense_map_new)

### 非Ros部分（数据集）
<font style="color:#DF2A3F;">ubantu20.04配置文件改c++14，以及一些库版本对应自己的，比如pcl和opencv，</font>

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746004671148-cab54179-8812-408e-b09b-d734f1dd21f7.png)

改了c++14后编译成功，

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746004902539-b03cab70-614c-4990-8f8c-67f35676a6e3.png)

运行数据集，

```yaml
./Examples/RGB-D/rgbd_tum Vocabulary/ORBvoc.txt Examples/RGB-D/TUM3.yaml /home/teng/dynamic_slam/ORB_SLAM3/Datasets/TUM/rgbd_dataset_freiburg3_walking_xyz /home/teng/dynamic_slam/ORB_SLAM3/Datasets/TUM/rgbd_dataset_freiburg3_walking_xyz/associations.txt
```

出现段错误闪退，

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746005125470-04e062a3-45b8-4653-b764-9fec58f0669f.png)

。。。莫名其妙的问题，不知道怎么解决

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746081065029-d4f0aeae-5ee5-4639-b357-faac9a50f21b.png)



---

**<font style="color:#DF2A3F;">将所有配置文件中的-march=native都删除掉，再次编译运行，成功！</font>**

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746354131756-89234c9d-8e85-436d-a348-85090c0d61e9.png)

发现不能保存地图以及保存关键帧数据文件，中断后什么也没保存，

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746356038323-dd6b30c7-f5a1-44f8-9a6a-db9ae50b86a9.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746357368836-0260c9da-ebb2-4d3c-ab8c-0afd4d66adc9.png)

地图可以保存了，关键帧txt文件还是没有保存，改了绝对路径也不行。

[运行ORB_SLAM2无法自动生成轨迹（KeyFrameTrajectory.txt）文件问题的解决-CSDN博客](https://blog.csdn.net/qq_41873211/article/details/116059484)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746357658312-58aa9985-17eb-4ee7-8615-c7604f1715be.png)

取消system.cc中这一段注释，在编译运行，没效果。

**<font style="color:#DF2A3F;">！！！</font>**

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746361559362-6718a00d-4ac7-466f-b59d-52c74bd1c7a5.png)

还是没效果。

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746363951484-f6f84c64-85e0-414e-8b4a-9276af97732c.png)

去掉这个睡眠时间，

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746364136053-d35766c3-4f1e-4706-b97a-5adbbb1e5204.png)

可以保存了，但是出现段错误。

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746364385981-fab7d87b-ed19-48c2-97c1-5d7256869df8.png)

<font style="color:#DF2A3F;">改成睡眠1ms，没有段错误也可以保存。</font>

---

### ROS部分（相机）
编译ros部分之前需要在ros部分<font style="color:rgb(77, 77, 77);">CMakeLists.txt中添加pcl相关库链接，以及改c++11为c++14，</font>

```yaml
find_package(Eigen3 3.1.0 REQUIRED)
find_package(Pangolin REQUIRED)
find_package(PCL REQUIRED)    //新增这一行
 
include_directories(
${PROJECT_SOURCE_DIR}
${PROJECT_SOURCE_DIR}/../../../
${PROJECT_SOURCE_DIR}/../../../include
${PROJECT_SOURCE_DIR}/../../../include/CameraModels
${PROJECT_SOURCE_DIR}/../../../Thirdparty/Sophus
${Pangolin_INCLUDE_DIRS}
${PCL_INCLUDE_DIRS}     //新增这一行
)
 
add_definitions(  ${PCL_DEFINITIONS} )     //新增这一行
link_directories(  ${PCL_LIBRARY_DIRS} )  //新增这一行
 
set(LIBS 
${OpenCV_LIBS} 
${EIGEN3_LIBS}
${Pangolin_LIBRARIES}
${PROJECT_SOURCE_DIR}/../../../Thirdparty/DBoW2/lib/libDBoW2.so
${PROJECT_SOURCE_DIR}/../../../Thirdparty/g2o/lib/libg2o.so
${PROJECT_SOURCE_DIR}/../../../lib/libORB_SLAM3.so
-lboost_system
)
```

```yaml
export ROS_PACKAGE_PATH=${ROS_PACKAGE_PATH}:/home/teng/Dy_Nav/ORB_SLAM3_detailed_comments-dense_map_new/Examples/ROS
可能已经存在ORB-SLAM3的ros包，可以设置临时ROS_PACKAGE_PATH进行编译
export ROS_PACKAGE_PATH=/home/teng/Dy_Nav/ORB_SLAM3_detailed_comments-dense_map_new/Examples/ROS/ORB_SLAM3:$ROS_PACKAGE_PATH
```

```yaml
chmod +x build_ros.sh
./build_ros.sh
```

```yaml
// D455 相机
message_filters::Subscriber<sensor_msgs::Image> rgb_sub(nh, "/camera/color/image_raw", 1);
message_filters::Subscriber<sensor_msgs::Image> depth_sub(nh, "/camera/aligned_depth_to_color/image_raw", 1);
```

```yaml
roslaunch realsense2_camera rs_rgbd.launch 
roslaunch realsense2_camera rs_rgbd.launch align_depth:=true
rosrun ORB_SLAM3 RGBD Vocabulary/ORBvoc.txt Examples/ROS/ORB_SLAM3/MyD455.yaml  
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746360510070-2dce5276-1a35-4470-9851-1d5af837ea85.png)

又出现段错误。

```yaml
rosrun ORB_SLAM3 RGBD Vocabulary/ORBvoc.txt Examples/RGB-D/RealSense_D435i.yaml
```

```yaml
PointCloudMapping.Resolution: 0.01
meank: 50
thresh: 2.0
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746360929990-72a6ef42-5559-4f8b-b4bb-9098314e5904.png)![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746361204624-e256a0fa-79ab-407d-9d15-fc6f8773b843.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746361040824-e55e501b-819a-478f-9ce1-fc00fff85b1f.png)

### 八叉树地图
详细步骤参考第四节，

```yaml
source ./devel/setup.bash
roslaunch publish_pointcloud demo.launch 
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746364808595-2f06dfa5-36f1-4405-a6ae-9a2902858fb0.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746365254944-59790077-922c-4b0a-b1e8-0e09519d8325.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746365009284-86b9680a-342b-41fc-9f22-b3b2c3cfd739.png)





参考资料：[实测 （四）NVIDIA Xavier NX + D435i / 奥比中光Astrapro 相机+ ORB-SLAM 2 + 3 稠密回环建图_奥比中光+orb-slam3的稠密回环-CSDN博客](https://blog.csdn.net/weixin_62952541/article/details/130043783)

## 三、ORB-SLAM2_RGBD_DENSE_MAP（可回环）
[https://github.com/xiaobainixi/ORB-SLAM2_RGBD_DENSE_MAP](https://github.com/xiaobainixi/ORB-SLAM2_RGBD_DENSE_MAP)





参考资料：[实测 （二）NVIDIA Xavier NX + D435i / 奥比中光Astrapro 相机+ ORB-SLAM 2 + 3 稠密回环建图_realsense d435 奥比中光-CSDN博客](https://blog.csdn.net/weixin_62952541/article/details/130019883)

## 四、改高翔<font style="color:rgb(77, 77, 77);">ORBSLAM2_with_pointcloud_map（不可回环）</font>
```yaml
mkdir -p orb2_ws/src
cd orb2_ws
catkin_make
 
cd orb2_ws/src/
git clone https://gitcode.com/gaoxiang12/ORBSLAM2_with_pointcloud_map.git
 
cd ORB_SLAM2_modified
chmod +x build.sh
./build.sh
```

### 非Ros部分
按照它[https://blog.csdn.net/qq_45509667/article/details/138628381](https://blog.csdn.net/qq_45509667/article/details/138628381)改了错误1和错误2,非ros部分一次编译成功。

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746105422612-1c06e1fe-e19b-4826-ba04-d966fed3fede.png)

注意！编译成功后的可执行文件在bin目录。

```yaml
./bin/rgbd_tum Vocabulary/ORBvoc.txt Examples/RGB-D/TUM3.yaml /home/teng/dynamic_slam/ORB_SLAM3/Datasets/TUM/rgbd_dataset_freiburg3_walking_xyz /home/teng/dynamic_slam/ORB_SLAM3/Datasets/TUM/rgbd_dataset_freiburg3_walking_xyz/associations.txt
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746107616952-d11955c0-1162-402f-bfe7-7e86c5cf91e6.png)

发现有毛病，看不到点云地图地图，只能看到坐标系... ...

```yaml
PointCloudMapping.Resolution:0.01
meank:50
thresh:2.0
```

然后将原本的可视化灰色点云地图改成可视化彩色点云地图并保存，

```yaml
pcl_viewer vslam.pcd
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746109299363-38628b93-d6fd-48a9-8be8-bc3b4d183d1d.png)

---

### Ros部分
编译ros部分之前，需要添加ROS包路径到环境变量，然后source ~/.bashrc一下，

<font style="color:#ECAA04;">接着</font><font style="color:#ECAA04;">进入/opt/ros/noetic/目录下会有一个文件setup.bash，在当前目录下打开一个终端执行：</font><font style="color:#ECAA04;">sudo vim setup.bash也添加ROS包路径，</font><font style="color:#ECAA04;">然后source setup.bash刷新一下，</font><font style="color:#ECAA04;">再编译。【没必要】</font>

<font style="color:#DF2A3F;">可能会rosbuild报错，</font>![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746110938914-565bee38-279b-4ad9-9a3e-15b7bbba7ce1.png)

```yaml
export ROS_PACKAGE_PATH=${ROS_PACKAGE_PATH}:/home/teng/Dy_Nav/orb2_ws/src/ORB_SLAM2_modified/Examples/ROS
```

```yaml
source /opt/ros/noetic/setup.bash
source ~/Dy_Nav/orb2_ws/devel/setup.bash  # 如果你已经编译过工作空间
echo $ROS_PACKAGE_PATH
```

<font style="color:#DF2A3F;">发现还是rosbuild报错？！！</font>

问题解决：[orb_slam2编译 ./build_ros.sh出现问题 很久没办法解决 请大家帮个忙谢谢！_编程语言-CSDN问答](https://ask.csdn.net/questions/7447228)

```yaml
鱼香一键安装rosdepc（安不上用热点）
wget http://fishros.com/install -O fishros && . fishros
sudo rosdepc init
rosdepc update
```

再次编译又报错，

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746173511571-841cfffb-a04f-43ce-89c8-614238f3b5ef.png)

```yaml
ORB_SLAM2_modified/Examples/ROS/ORB_SLAM2/../../../include/pointcloudmapping.h:25:10: fatal error: pcl/common/transforms.h: 没有那个文件或目录
   25 | #include <pcl/common/transforms.h>
      |          ^~~~~~~~~~~~~~~~~~~~~~~~~
compilation terminated.
```

```yaml
find_package(OpenCV 3.4.5 QUIET) #改
find_package( PCL 1.10 REQUIRED )  #添加

include_directories(
${PROJECT_SOURCE_DIR}
${PROJECT_SOURCE_DIR}/../../../
${PROJECT_SOURCE_DIR}/../../../include
${Pangolin_INCLUDE_DIRS}
${PCL_INCLUDE_DIRS}  #添加
)

#添加
add_definitions( ${PCL_DEFINITIONS} )
link_directories( ${PCL_LIBRARY_DIRS} )

target_link_libraries(Mono
${LIBS}
${PCL_LIBRARIES}  #添加
)
```

添加pcl库链接，并且将c++11改为c++14，再编译，

```yaml
/usr/include/eigen3/Eigen/src/Core/util/Constants.h:162:37: note: declared here
  162 | EIGEN_DEPRECATED const unsigned int AlignedBit = 0x80;
      |                                     ^~~~~~~~~~
[ 66%] Linking CXX executable ../Mono
[ 77%] Linking CXX executable ../MonoAR
/usr/bin/ld: warning: libopencv_imgproc.so.4.2, needed by /opt/ros/noetic/lib/libcv_bridge.so, may conflict with libopencv_imgproc.so.3.4
/usr/bin/ld: CMakeFiles/MonoAR.dir/src/AR/ViewerAR.cc.o: undefined reference to symbol '_ZN2cv7putTextERKNS_17_InputOutputArrayERKNSt7__cxx1112basic_stringIcSt11char_traitsIcESaIcEEENS_6Point_IiEEidNS_7Scalar_IdEEiib'
/usr/bin/ld: /usr/lib/x86_64-linux-gnu/libopencv_imgproc.so.4.2.0: error adding symbols: DSO missing from command line
collect2: error: ld returned 1 exit status
make[2]: *** [CMakeFiles/MonoAR.dir/build.make:252：../MonoAR] 错误 1
make[1]: *** [CMakeFiles/Makefile2:487：CMakeFiles/MonoAR.dir/all] 错误 2
make[1]: *** 正在等待未完成的任务....
/usr/bin/ld: warning: libopencv_core.so.4.2, needed by /opt/ros/noetic/lib/libcv_bridge.so, may conflict with libopencv_core.so.3.4
[ 77%] Built target Mono
[ 88%] Linking CXX executable ../RGBD
[100%] Linking CXX executable ../Stereo
/usr/bin/ld: warning: libopencv_imgproc.so.4.2, needed by /opt/ros/noetic/lib/libcv_bridge.so, may conflict with libopencv_imgproc.so.3.4
/usr/bin/ld: warning: libopencv_core.so.4.2, needed by /opt/ros/noetic/lib/libcv_bridge.so, may conflict with libopencv_core.so.3.4
/usr/bin/ld: CMakeFiles/Stereo.dir/src/ros_stereo.cc.o: undefined reference to symbol '_ZNK2cv8FileNodecviEv'
/usr/bin/ld: /usr/lib/x86_64-linux-gnu/libopencv_core.so.4.2.0: error adding symbols: DSO missing from command line
collect2: error: ld returned 1 exit status
make[2]: *** [CMakeFiles/Stereo.dir/build.make:182：../Stereo] 错误 1
make[1]: *** [CMakeFiles/Makefile2:514：CMakeFiles/Stereo.dir/all] 错误 2
/usr/bin/ld: warning: libopencv_core.so.4.2, needed by /opt/ros/noetic/lib/libcv_bridge.so, may conflict with libopencv_core.so.3.4
[100%] Built target RGBD
make: *** [Makefile:130：all] 错误 2
teng@teng-JiguangPro:~/Dy_Nav/orb2_ws/src/ORB_SLAM2_modified$ 
```

+ 日志显示，你的系统中有两个不同版本的OpenCV库：`libopencv_imgproc.so.4.2` 和 `libopencv_imgproc.so.3.4`。
+ `/opt/ros/noetic/lib/libcv_bridge.so` 依赖于 `libopencv_imgproc.so.4.2`，但你的项目可能链接了 `libopencv_imgproc.so.3.4`。

<font style="color:#DF2A3F;">两者需要一致，于是改成opencv4.2.0.</font>

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746174769388-358119cc-3d05-4b82-a79d-be2fa042900a.png)

OK，编译成功，没有报错！

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746175054295-9b7effd5-abe7-4c64-923a-c6eb9845322e.png)

```yaml
roscore
rosrun ORB_SLAM2 RGBD Vocabulary/ORBvoc.txt Examples/RGB-D/TUM3.yaml
rosbag play xxx
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746175643362-8dd3687a-8f91-4f49-8895-536fa67bde9d.png)

<font style="color:#DF2A3F;">又出现段错误!</font>

[（十一）ORBSLAM2在ROS下运行 - 小C酱油兵 - 博客园](https://www.cnblogs.com/yepeichu/p/10896201.html)

[ROS知识(12)----cv_bridge依赖opencv版本的问题 - horsetail - 博客园](https://www.cnblogs.com/cv-pr/p/5366764.html)

```yaml
sudo apt-get remove ros-indigo-cv-bridge
git clone https://github.com/ros-perception/vision_opencv.git
catkin_make --pkg cv_bridge
```

---

前面我非Ros部分使用的opencv3.4.5编译的，Ros部分使用的opencv4.2.0编译的（不用这个默认版本会报错），

**<font style="color:#DF2A3F;">下面先不卸载，先全部使用默认的cv_bridge对应的opencv4.2.0版本试一试，</font>**

<font style="color:#DF2A3F;">出现之前opencv3.4.5没发送生的报错</font>，

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746177709100-6edc485e-b760-4e56-bcf4-3c52ac714aa7.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746178077043-1c638c2d-9c7e-41ea-b986-4d53b376e527.png)

<font style="color:#DF2A3F;">全部改掉后，编译成功！（前面opencv3.4.5没报错这个问题，说明还没有完全弃用）运行也成功。</font>

再次编译Ros部分，编译成功，并且没有警告冲突了，

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746178970474-86049ca2-4d03-41d8-8f3d-447028126834.png)

```yaml
roscore
rosrun ORB_SLAM2 Stereo Vocabulary/ORBvoc.txt Examples/Stereo/EuRoC.yaml true
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746179118928-e0cbddb7-86d4-4149-bac5-1cd54ea67be1.png)

```yaml
rosbag play --pause MH_01_easy.bag /cam0/image_raw:=/camera/left/image_raw /cam1/image_raw:=/camera/right/image_raw
```

```yaml
ORB Extractor Parameters: 
- Number of Features: 1200
- Scale Levels: 8
- Scale Factor: 1.2
- Initial Fast Threshold: 20
- Minimum Fast Threshold: 7

Depth Threshold (Close/Far Points): 3.85272
New map created with 638 points
receive a keyframe, id = 1
generate point cloud for kf 1, size=0
terminate called after throwing an instance of 'pcl::IOException'
  what():  : [pcl::PCDWriter::writeBinary] Input point cloud has no data!
已放弃 (核心已转储)

```



... ...

没有有深度信息的rosbag数据包，故先测试单目和双目模式，（后续直接使用相机测试RGBD模式）

```yaml
rosrun ORB_SLAM2 Stereo Vocabulary/ORBvoc.txt Examples/Stereo/EuRoC.yaml true
rosbag play --pause MH_01_easy.bag /cam0/image_raw:=/camera/left/image_raw /cam1/image_raw:=/camera/right/image_raw
```

```yaml
rosrun ORB_SLAM2 Mono Vocabulary/ORBvoc.txt Examples/Monocular/EuRoC.yaml
rosbag play --pause MH_01_easy.bag /cam0/image_raw:=/camera/image_raw  也闪退pcl报错
```

```yaml
rosbag play dataset-room1_512_16.bag /cam0/image_raw:=/camera/image_raw 
当前帧有显示，点云地图没有显示
```



**禁用或修改点云保存逻辑**‌（临时解决方案）

[PCL存储点云错误pcl::IOException what() [pcl::PCDWriter::writeASCII] Could not open file for writing_vs pcl could not open file for writing-CSDN博客](https://blog.csdn.net/tuck_frump/article/details/121018489)

`pcl::io::savePCDFileBinary("vslam.pcd", *globalMap);` 

‌实时保存‌： 如果将 `savePCDFileBinary` 写在循环内，每次循环都会保存当前的全局点云地图到文件。这意味着每次有新的关键帧被处理并添加到全局地图后，地图都会被保存。

‌最终保存‌： 如果将 `savePCDFileBinary` 写在循环外，通常意味着你只想在程序结束或某个特定条件满足时保存最终的全局点云地图。

```yaml
void PointCloudMapping::viewer()
{
    // 创建一个点云查看器，窗口标题为"viewer"
    pcl::visualization::CloudViewer viewer("viewer");
    // int saveInterval = 10; // 添加 每处理10个关键帧保存一次地图
    // int frameCount = 0; //添加

    // 进入一个无限循环，持续更新和显示点云地图，直到接收到关闭信号
    while(1)
    {
        {
            // 使用互斥锁保护对关闭标志的访问
            unique_lock<mutex> lck_shutdown( shutDownMutex );
            // 如果关闭标志被设置为true，则退出循环
            if (shutDownFlag)
            {
                break;
            }
        }

        {
            // 使用互斥锁和条件变量等待关键帧的更新
            unique_lock<mutex> lck_keyframeUpdated( keyFrameUpdateMutex );
            // 等待条件变量被通知，表示有新的关键帧添加
            keyFrameUpdated.wait( lck_keyframeUpdated );
        }

        // 关键帧已更新，获取当前关键帧的数量
        size_t N=0;
        {
            // 使用互斥锁保护对关键帧列表的访问
            unique_lock<mutex> lck( keyframeMutex );
            N = keyframes.size(); // 获取当前关键帧的数量
        }

        // 处理从lastKeyframeSize到N之间的所有新添加的关键帧
        for ( size_t i=lastKeyframeSize; i<N ; i++ )
        {
            // 为每个新关键帧生成点云，并添加到全局点云地图中
            PointCloud::Ptr p = generatePointCloud( keyframes[i], colorImgs[i], depthImgs[i] );
            *globalMap += *p; // 将生成的点云添加到全局点云地图中
        }

        // 将当前的全局点云地图保存为二进制PCD文件
        //pcl::io::savePCDFileBinary("vslam.pcd", *globalMap); // 添加 注意：这一步在每次循环中都会执行
        // frameCount++;
        // if (frameCount >= saveInterval)
        // {
        //     pcl::io::savePCDFileBinary("vslam.pcd", *globalMap); // 条件保存
        //     frameCount = 0; // 重置计数器
        // }

        // 创建一个新的点云对象，用于存储滤波后的点云
        PointCloud::Ptr tmp(new PointCloud());
        // 使用体素滤波器对全局点云地图进行滤波
        voxel.setInputCloud( globalMap );
        voxel.filter( *tmp );
        // 将滤波后的点云与全局点云地图交换，更新全局点云地图
        globalMap->swap( *tmp );

        // 使用点云查看器显示更新后的全局点云地图
        viewer.showCloud( globalMap );
        // 打印当前全局点云地图中的点数
        cout << "show global map, size=" << globalMap->points.size() << endl;

        // 更新最后处理的关键帧数量，以便在下一次循环中处理新添加的关键帧
        lastKeyframeSize = N;
    }
    // 如果只需要在程序结束时保存一次地图，可以在这里添加保存代码
    pcl::io::savePCDFileBinary("vslam_final.pcd", *globalMap);
}
```

<font style="color:#DF2A3F;">这种方法可行，但是不显示三色彩色点云地图，中断后还是相同报错。（不可视化并保存地图就不会报错）</font>

```yaml
receive a keyframe, id = 571
generate point cloud for kf 571, size=0
show global map, size=0
receive a keyframe, id = 572
generate point cloud for kf 572, size=0
show global map, size=0
^Cshow global map, size=0
terminate called after throwing an instance of 'pcl::IOException'
  what():  : [pcl::PCDWriter::writeBinary] Input point cloud has no data!
已放弃 (核心已转储)
```

双目：![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746253241817-f0ad0892-4914-493a-831d-308ae9efe9ac.png)![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746254151852-eeaef642-66d0-4494-b8e8-a308c2b0bd48.png)

单目：

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746254521926-fc5dfd3c-7d2f-46dd-a13d-312bd24d9dec.png)

```yaml
PointCloudMapping.Resolution:0.01
meank:50
thresh:2.0
```

还是没有变化。

```yaml
void PointCloudMapping::viewer()
{
    // 创建一个点云查看器，窗口标题为"viewer"
    pcl::visualization::CloudViewer viewer("viewer");

    // 进入一个无限循环，持续更新和显示点云地图，直到接收到关闭信号
    while(1)
    {
        {
            // 使用互斥锁保护对关闭标志的访问
            unique_lock<mutex> lck_shutdown(shutDownMutex);
            // 如果关闭标志被设置为true，则退出循环
            if (shutDownFlag)
            {
                break;
            }
        }

        {
            // 使用互斥锁和条件变量等待关键帧的更新
            unique_lock<mutex> lck_keyframeUpdated(keyFrameUpdateMutex);
            // 等待条件变量被通知，表示有新的关键帧添加
            keyFrameUpdated.wait(lck_keyframeUpdated);
        }

        // 关键帧已更新，获取当前关键帧的数量
        size_t N = 0;
        {
            // 使用互斥锁保护对关键帧列表的访问
            unique_lock<mutex> lck(keyframeMutex);
            N = keyframes.size(); // 获取当前关键帧的数量
        }

        // 处理从lastKeyframeSize到N之间的所有新添加的关键帧
        for (size_t i = lastKeyframeSize; i < N; i++)
        {
            // 为每个新关键帧生成点云，并添加到全局点云地图中
            PointCloud::Ptr p = generatePointCloud(keyframes[i], colorImgs[i], depthImgs[i]);
            if (p != nullptr) // 检查指针是否为空
            {
                *globalMap += *p; // 将生成的点云添加到全局点云地图中
            }
            else
            {
                // 如果需要，可以在这里添加日志记录或错误处理
                std::cerr << "Warning: Generated point cloud is null for keyframe " << i << std::endl;
            }
        }

        // 检查全局点云地图指针是否为空（通常不需要，但如果初始化可能为空则需要）
        if (globalMap != nullptr)
        {
            // 将当前的全局点云地图保存为二进制PCD文件
            pcl::io::savePCDFileBinary("vslam.pcd", *globalMap); // 注意：这一步在每次循环中都会执行

            // 创建一个新的点云对象，用于存储滤波后的点云
            PointCloud::Ptr tmp(new PointCloud());
            // 使用体素滤波器对全局点云地图进行滤波
            voxel.setInputCloud(globalMap);
            voxel.filter(*tmp);
            // 将滤波后的点云与全局点云地图交换，更新全局点云地图
            globalMap->swap(*tmp);

            // 使用点云查看器显示更新后的全局点云地图
            viewer.showCloud(globalMap);
            // 打印当前全局点云地图中的点数
            cout << "show global map, size=" << globalMap->points.size() << endl;
        }
        else
        {
            std::cerr << "Error: Global map pointer is null." << std::endl;
            // 可以选择在这里添加退出逻辑或继续循环
        }

        // 更新最后处理的关键帧数量，以便在下一次循环中处理新添加的关键帧
        lastKeyframeSize = N;
    }
}

```



---

<font style="color:#DF2A3F;">我猜测只有RGBD模式的点云地图可用。</font>

由于只能使用rosbag传入，下面下载一个RGBD数据集的bag文件进行试验，

```yaml
rosbag play --pause rgbd_dataset_freiburg1_xyz.bag /camera/rgb/image_color:=/camera/rgb/image_raw /camera/depth/image:=/camera/depth_registered/image_raw
rosbag play --pause rgbd_dataset_freiburg1_xyz.bag /camera/rgb/camera_info:=/camera/rgb/image_raw /camera/depth/camera_info:=/camera/depth_registered/image_raw
```

还是一样的问题，说明不是数据集问题。



---

### 八叉树地图构建
```yaml
打开一个终端.(ctrl+alt+T)输入下面指令安装octomap.
sudo apt-get install ros-noetic-octomap-ros #安装octomap
sudo apt-get install ros-noetic-octomap-msgs
sudo apt-get install ros-noetic-octomap-server
 
安装octomap 在 rviz 中的插件
sudo apt-get install ros-noetic-octomap-rviz-plugins
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746256937106-75828aae-4a68-4006-b4b3-9429c6e63c8b.png)[GitHub - RuPingCen/publish_pointcloud: this code can be used for transfom the pointcloud into octomap](https://github.com/RuPingCen/publish_pointcloud)

```yaml
cd octomap_ws/src
git clone https://github.com/RuPingCen/publish_pointcloud.git
cd ..
catkin_make
```

<font style="color:rgb(77, 77, 77);">进入 /src/publish_pointcloud/src下的publish_pointcloud.cpp，修改pcd文件路径，</font>

```yaml
#开一个终端启动ros
roscore
#再开一个终端
rosrun publish_pointcloud publish_pointcloud
#打开rviz
rviz
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746257910516-f451cc35-bc33-4c00-b13c-f858ba090b7d.png)

<font style="color:rgb(77, 77, 77);"> 点击add</font>`<font style="color:rgb(77, 77, 77);">，添加 "PointCloud2模块"</font>`

`<font style="color:rgb(77, 77, 77);">设置topic为 "/pointcloud/output"</font>`

`<font style="color:rgb(77, 77, 77);">设置FixedFram为"camera"（如果不能选就手动输入“camera”）</font>`

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746257623658-3f7f598b-c9a2-455d-9696-61144bd5471d.png)

```yaml
roslaunch publish_pointcloud octomaptransform.launch
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746258581451-af411156-571b-4ebd-ad6f-9ed772b7ee84.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746258557059-b7237845-e7a1-4ffb-9713-a078f36f4289.png)

<font style="color:#DF2A3F;">有问题！发现是octomaptransform.launch中的frame_id的值写错了，应写camera而不是/camera。</font>

```yaml
roslaunch publish_pointcloud demo.launch
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746273119154-42a3e01d-8c58-435f-bfe9-73a9da0b2556.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746276916901-02cf9ec3-1123-446c-a3ec-308966f47d9b.png)

```yaml
rosrun octomap_server octomap_saver /topic
rosrun octomap_server octomap_saver -f my_map.ot
rosrun octomap_server octomap_saver -f my_map.bt
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746274114241-34d2769f-4bf8-4d22-be1f-208ac7340aa4.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746275915532-34cdc77b-c355-4e90-8de5-b83261113bed.png)

可能保存过程很慢。

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746275177138-26447394-5aa7-4dbc-ac68-a8971d6d0608.png)

```yaml
sudo apt install octovis
octovis my_map.ot
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746275152220-742baae7-31c7-4f8d-95a8-9d5f6ac23c50.png)

在窗口按1可以进行颜色渲染，

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746275590366-5fca5094-b61e-4b14-bc5e-43832d0a70e1.png)

```yaml
octovis my_map.bt
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746275771990-a6f011a5-e8a0-42ac-b82f-95c010afef6c.png)

按1上色，

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746275792857-55215eb6-874f-4242-857a-2767bb72c1a0.png)

```yaml
rosrun map_server map_saver -f my_map 没效果
```



---

[https://zhuanlan.zhihu.com/p/176507046](https://zhuanlan.zhihu.com/p/176507046)  [https://blog.51cto.com/u_13157605/6038355](https://blog.51cto.com/u_13157605/6038355)  [https://blog.51cto.com/u_13157605/6318627](https://blog.51cto.com/u_13157605/6318627)   [八叉树建立地图并实现路径规划导航（下）-阿里云开发者社区](https://developer.aliyun.com/article/855341)

[ROS 八叉树地图构建详解：使用 octomap_server 实现增量式建图_octomap 建图-CSDN博客](https://blog.csdn.net/m0_73640344/article/details/145838920)

```yaml
git clone https://github.com/OctoMap/octomap_mapping.git
roslaunch octomap_server octomap_mapping.launch
```



### 相机建图
```yaml
rs-capture
realsense-viewer
```

注意需要USB3，否则会数据传输不足。

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746278292243-3f88d370-d11c-48ff-845e-2ec28f695efd.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746278413993-fb66de26-82fc-4611-913f-47234eb23801.png)

```yaml
rgbd可能报错：安装sudo apt-get install ros-noetic-rgbd-launch
# 无点云
roslaunch realsense2_camera rs_camera.launch
# 有点云生成
roslaunch realsense2_camera demo_pointcloud.launch
# 生成对齐的深度图像
roslaunch realsense2_camera rs_rgbd.launch align_depth:=true
#其他使用说明见官方文档
https://github.com/IntelRealSense/realsense-ros/tree/ros1-legacy

roslaunch realsense2_camera rs_camera.launch align_depth:=true
```

打开ros_rgbd.cc，修改相机话题，然后build_ros.sh，

```yaml
// D455 相机
message_filters::Subscriber<sensor_msgs::Image> rgb_sub(nh, "/camera/color/image_raw", 1);
message_filters::Subscriber<sensor_msgs::Image> depth_sub(nh, "/camera/aligned_depth_to_color/image_raw", 1);
// Astra pro 相机
// message_filters::Subscriber<sensor_msgs::Image> rgb_sub(nh, "/camera/rgb/image_raw", 1);
// message_filters::Subscriber<sensor_msgs::Image> depth_sub(nh, "/camera/depth/image", 1);
```

新建一个相机参数配置文件MyD55.yaml，

```yaml
rostopic echo /camera/color/camera_info
```

```yaml
%YAML:1.0
 
#--------------------------------------------------------------------------------------------
# Camera Parameters. Adjust them!
#--------------------------------------------------------------------------------------------
 
# Camera calibration and distortion parameters (OpenCV) 
Camera.fx: 910.099731
Camera.fy: 909.994873
Camera.cx: 639.493347
Camera.cy: 359.377410

Camera.k1: 0.0
Camera.k2: 0.0
Camera.p1: 0.0
Camera.p2: 0.0
Camera.p3: 0.0

Camera.width: 640
Camera.height: 480
# Camera frames per second 
Camera.fps: 30.0

# IR projector baseline times fx (aprox.)
# bf = baseline (in meters) * fx, D435i的 baseline = 50 mm 
Camera.bf: 50.0
 
# Color order of the images (0: BGR, 1: RGB. It is ignored if images are grayscale)
Camera.RGB: 1
 
# Close/Far threshold. Baseline times.
ThDepth: 40.0
 
# Deptmap values factor
DepthMapFactor: 1000.0
 
#--------------------------------------------------------------------------------------------
# ORB Parameters
#--------------------------------------------------------------------------------------------
 
# ORB Extractor: Number of features per image
ORBextractor.nFeatures: 1000
 
# ORB Extractor: Scale factor between levels in the scale pyramid 	
ORBextractor.scaleFactor: 1.2
 
# ORB Extractor: Number of levels in the scale pyramid	
ORBextractor.nLevels: 8
 
# ORB Extractor: Fast threshold
# Image is divided in a grid. At each cell FAST are extracted imposing a minimum response.
# Firstly we impose iniThFAST. If no corners are detected we impose a lower value minThFAST
# You can lower these values if your images have low contrast			
ORBextractor.iniThFAST: 20
ORBextractor.minThFAST: 7
 
#--------------------------------------------------------------------------------------------
# Viewer Parameters
#--------------------------------------------------------------------------------------------
Viewer.KeyFrameSize: 0.05
Viewer.KeyFrameLineWidth: 1
Viewer.GraphLineWidth: 0.9
Viewer.PointSize:2
Viewer.CameraSize: 0.08
Viewer.CameraLineWidth: 3
Viewer.ViewpointX: 0
Viewer.ViewpointY: -0.7
Viewer.ViewpointZ: -1.8
Viewer.ViewpointF: 500
 
PointCloudMapping.Resolution: 0.01
meank: 50
thresh: 2.0

```

---

```yaml
roslaunch realsense2_camera rs_rgbd.launch 
roslaunch realsense2_camera rs_rgbd.launch align_depth:=true
rosrun ORB_SLAM2 RGBD Vocabulary/ORBvoc.txt Examples/ROS/ORB_SLAM2/MyD455.yaml
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746339647120-d0f466ac-2cec-42e1-aa8a-35230de4d29c.png)![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746342261623-897e5ef4-3f79-4035-9ad6-3c5d242c21df.png)

可能是默认分辨率太高问题。

```yaml
roslaunch realsense2_camera rs_camera.launch align_depth:=true
rosrun ORB_SLAM2 RGBD Vocabulary/ORBvoc.txt Examples/ROS/ORB_SLAM2/MyD455.yaml
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746340849388-d08547ae-28f4-4520-8549-da2c6ad2c8d6.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746340830321-b0a12c40-d83a-4a0a-937b-6bced58b3905.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746340728433-9d6c7f5f-a32a-43f8-bde9-ac57ef0f3b87.png)



---

### 转八叉树地图
![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746347010192-155477fb-b414-4896-95ae-ef565b3bb721.png)

发现点云与网格是垂直的，主要是因为相机坐标系定义为：z轴往前，x轴往左（不是常见的往右是因为我的图像采集时镜像了），y轴往下，RVIZ默认显示的是xy平面，改成显示xz平面就正常了，

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746347893550-5c7a0c13-9a15-4cd4-b31b-22149e69f3a6.png)

[使用octomap_server将点云地图转化为八叉树地图和占据栅格地图_深度图构建八叉树地图-CSDN博客](https://blog.csdn.net/sylin211/article/details/93743724)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746348678811-7721dcc6-6cdf-447b-bf25-18fe7db2cdd9.png)

<font style="color:#DF2A3F;">发现投影的栅格地图还是垂直，该方法不行，</font>

对点云坐标做变换，绕x轴旋转90度，将z轴指向上方，在将点云转变为ros信息之前使用pcl::transformPointCloud()函数将点云变换一下，

```yaml

#include <Eigen/Core>          // 包含基本的Eigen矩阵和向量定义
#include <Eigen/Geometry>      // 包含旋转、平移等几何变换
#include <pcl/common/transforms.h>

	pcl::PointCloud<pcl::PointXYZ> cloud;  
	sensor_msgs::PointCloud2 output;  
	pcl::io::loadPCDFile (path, cloud);  
	//点云旋转90度
	Eigen::Affine3f transform = Eigen::Affine3f::Identity();
    transform.rotate(Eigen::AngleAxisf(-M_PI/2, Eigen::Vector3f(1,0,0)));
    pcl::transformPointCloud(cloud, cloud, transform);
	//。。。。
	pcl::toROSMsg(cloud,output);// 转换成ROS下的数据类型 最终通过topic发布
```

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746349995466-4a26261c-08c2-4136-9c7b-ce2b73854994.png)

白色为可行区域，黑色为占据区域，

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746351564984-1683896a-d587-45fc-ae43-9d6309a1dd2f.png)

![](https://cdn.nlark.com/yuque/0/2025/png/39216292/1746351489425-be196029-a464-4c87-b832-294eb38d56c0.png)

想只保存网格地图，保存不了。





参考资料：

[ORBSLAM2实验记录(1)——稠密建图_orbslam2稠密建图-CSDN博客](https://blog.csdn.net/weixin_52379562/article/details/125940140)

修改：

[Ubuntu20.04下ORB-SLAM2稠密建图+octomap生成八叉树地图（上）_orbslam2稠密建图-CSDN博客](https://blog.csdn.net/qq_45509667/article/details/138628381)

[Ubuntu20.04下ORB-SLAM2稠密建图+octomap生成八叉树地图（下）_ubuntu20.04安装octomap-CSDN博客](https://blog.csdn.net/qq_45509667/article/details/138650779?spm=1001.2014.3001.5502)

[用D435i跑高翔ORB_SLAM2稠密建图_orbslam2 高翔-CSDN博客](https://blog.csdn.net/m0_60355964/article/details/124850849)

[Octomap 在ROS环境下实时显示_octomap在ros环境下实时显示-飞天熊猫-CSDN博客](https://blog.csdn.net/crp997576280/article/details/74605766)

[GitHub - OctoMap/octomap_mapping: ROS stack for mapping with OctoMap, contains octomap_server package](https://github.com/OctoMap/octomap_mapping)



## 五、ORB-SLAM2在线构建稠密点云地图
```yaml
cd octomap_ws/src
git clone -b v1.0.0 https://github.com/RuPingCen/pointcloud_mapping.git
cd ../
catkin_make
```









参考资料：

[ORB-SLAM2 在线构建稠密点云（一）_mbuseexact-CSDN博客](https://blog.csdn.net/crp997576280/article/details/88899163)

[ORB-SLAM2 在线构建稠密点云（二）_orb-slam net-CSDN博客](https://blog.csdn.net/crp997576280/article/details/104220926)

[GitHub - RuPingCen/ORB_SLAM2 at v1.0.0](https://github.com/RuPingCen/ORB_SLAM2/tree/v1.0.0)

[GitHub - RuPingCen/pointcloud_mapping: 利用位姿估计器输出的Tcw信息对图像帧进行拼接生成全局点云](https://github.com/RuPingCen/pointcloud_mapping)

[ORB-SLAM2 在线构建稠密点云（室内RGBD篇）_orb-slam2 在线构建稠密点云(室内rgbd篇)-CSDN博客](https://blog.csdn.net/qq_36754438/article/details/113832949)

