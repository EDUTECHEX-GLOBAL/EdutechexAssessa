import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Upload, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { ShowLoading, HideLoading } from "../../redux/rootSlice";
import axios from "axios";
import {
  LoadingOutlined,
  UploadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const AdminDiscover = () => {
  const [form] = Form.useForm();
  const [discoverImgUrl, setDiscoverImgUrl] = useState("");
  const [discoverImgKey, setDiscoverImgKey] = useState(null); // store key for DB
  const [compImageUrls, setCompImageUrls] = useState([]); // preview URLs
  const [compImageMeta, setCompImageMeta] = useState([]); // [{ id, key, url }]
  const [uploading, setUploading] = useState(false);
  const dispatch = useDispatch();
  const { assessaData } = useSelector((state) => state.root);

  useEffect(() => {
    if (assessaData && assessaData.discover && assessaData.discover.length > 0) {
      const discover = assessaData.discover[0];
      // backend returns discover.imgUrl (signed URL) and discover.imgUrlKey (key or null)
      setDiscoverImgUrl(discover.imgUrl || "");
      setDiscoverImgKey(discover.imgUrlKey || null);
      setCompImageUrls(discover.compImageUrls || []);
      // If backend returned discovercompimg docs they appear in assessaData.discovercompimg
      if (assessaData.discovercompimg && assessaData.discovercompimg.length > 0) {
        const meta = assessaData.discovercompimg.map((d) => ({
          id: d._id,
          key: d.imageUrlKey || null,
          url: d.imageUrl || null,
        }));
        setCompImageMeta(meta);
      } else {
        // sync compImageMeta with compImageUrls if we don't have discovercompimg
        setCompImageMeta(compImageUrls.map((u) => ({ id: null, key: null, url: u })));
      }
    }
  }, [assessaData]);

  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());
      // For DB we want to save S3 key (if we have it), otherwise keep existing URL
      const payload = {
        ...values,
        imgUrl: discoverImgKey ? discoverImgKey : discoverImgUrl,
        compImageUrls: compImageMeta.map((m) => (m.key ? m.key : m.url)),
      };

      const id = assessaData.discover[0]._id;
      const response = await axios.put(`/api/skillnaav/update-discover/${id}`, payload);
      dispatch(HideLoading());
      if (response.data.success) {
        message.success("Changes saved successfully");
      } else {
        message.error(response.data.message || "Failed to save changes");
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error("Failed to save changes. Please try again later.");
      console.error("Error:", error);
    }
  };

  // Upload discover image to backend -> S3
  const handleDiscoverImageUpload = async ({ file }) => {
    const selectedFile = file.originFileObj || file;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("folder", "discover");
      const res = await axios.post("/api/skillnaav/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { key, url } = res.data;
      // url is signed url (for preview), key is S3 object key (store in DB)
      setDiscoverImgKey(key);
      setDiscoverImgUrl(url);
      message.success("Discover image uploaded successfully");
    } catch (err) {
      console.error("Discover image upload error:", err);
      message.error("Failed to upload discover image");
    } finally {
      setUploading(false);
    }
  };

  // Upload company image(s)
  const handleCompanyImageUpload = async ({ file }) => {
    const selectedFile = file.originFileObj || file;
    if (compImageMeta.length >= 5) {
      message.warning("You can upload a maximum of 5 images.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("folder", "company");

      // upload to s3
      const uploadRes = await axios.post("/api/skillnaav/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { key, url } = uploadRes.data;

      // create a DiscoverCompImg doc in DB (your existing route)
      // we send the S3 key to DB so it stores the key; the GET route will return signed URL for display
      const addRes = await axios.post("/api/skillnaav/add-discover-comp-img", {
        imageUrl: key,
      });

      // addRes.data.data is the created document (createRoute returns it)
      const created = addRes.data.data;

      // update local preview/meta
      setCompImageUrls((prev) => [...prev, url]);
      setCompImageMeta((prev) => [...prev, { id: created._id, key, url }]);

      message.success("Company image uploaded successfully");
    } catch (error) {
      console.error("Company image upload error:", error);
      message.error("Failed to upload company image");
    } finally {
      setUploading(false);
    }
  };

  // Remove company image (using stored doc id or fallback to previous behavior)
  const handleImageRemove = async (urlToRemove) => {
    try {
      // find meta entry
      const idx = compImageMeta.findIndex((m) => m.url === urlToRemove);
      let id = null;
      if (idx !== -1) id = compImageMeta[idx].id;

      if (!id) {
        // fallback: previous code deleted by URL as id param; try that
        const resp = await axios.delete(
          `/api/skillnaav/delete-discover-comp-img/${encodeURIComponent(urlToRemove)}`
        );
        if (resp.data.success) {
          message.success("Company image deleted successfully");
          setCompImageUrls((prev) => prev.filter((u) => u !== urlToRemove));
          setCompImageMeta((prev) => prev.filter((m) => m.url !== urlToRemove));
        } else {
          message.error(resp.data.message || "Failed to delete company image");
        }
        return;
      }

      // delete by id
      const response = await axios.delete(`/api/skillnaav/delete-discover-comp-img/${id}`);
      if (response.data.success) {
        message.success("Company image deleted successfully");
        setCompImageUrls((prev) => prev.filter((u) => u !== urlToRemove));
        setCompImageMeta((prev) => prev.filter((m) => m.id !== id));
      } else {
        message.error(response.data.message || "Failed to delete company image");
      }
    } catch (error) {
      console.error("Company image delete error:", error);
      message.error("Failed to delete company image");
    }
  };

  if (!assessaData || !assessaData.discover || assessaData.discover.length === 0) {
    return <Spin spinning={true} indicator={antIcon} />;
  }

  const discover = assessaData.discover[0];
  const discovercompimg = assessaData.discovercompimg || [];

  return (
    <div className="p-8 bg-gray-100 rounded-lg shadow-md max-w-3xl mx-auto my-12 font-roboto">
      <h1 className="text-2xl font-bold text-center mb-8 text-gray-700">
        Edit Discover Section
      </h1>
      <Form form={form} onFinish={onFinish} layout="vertical" initialValues={discover}>
        <Form.Item name="discoverheading" label="Discover Heading">
          <Input placeholder="Enter Discover Heading" />
        </Form.Item>
        <Form.Item name="discoversubheading" label="Discover Sub Heading">
          <Input.TextArea rows={4} placeholder="Enter Discover Sub Heading" />
        </Form.Item>
        <Form.Item name="tryforfreebtn" label="Try for Free Button">
          <Input placeholder="Enter Try for Free Button" />
        </Form.Item>

        <Form.Item name="image" label="Upload Discover Image">
          <Upload
            name="image"
            listType="picture-card"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleDiscoverImageUpload}
          >
            {discoverImgUrl ? (
              <img src={discoverImgUrl} alt="Discover" className="w-full h-auto rounded-lg" />
            ) : (
              <div className="flex items-center justify-center border border-dashed border-gray-300 rounded-md cursor-pointer p-4">
                <UploadOutlined className="text-3xl text-blue-500" />
                <span className="ml-2 text-gray-500">Upload Discover Image</span>
              </div>
            )}
          </Upload>
          {discoverImgUrl && <Button type="link" onClick={() => { setDiscoverImgUrl(""); setDiscoverImgKey(null); }}>Remove</Button>}
          <p className="text-sm text-gray-500 mt-2">
            Please upload a high-quality image with recommended dimensions of 1200x800 pixels.
          </p>
        </Form.Item>

        <Form.Item label="Company Images">
          <Upload
            name="image"
            listType="picture-card"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleCompanyImageUpload}
          >
            <div className="flex items-center justify-center border border-dashed border-gray-300 rounded-md cursor-pointer p-4">
              <UploadOutlined className="text-3xl text-blue-500" />
              <span className="ml-2 text-gray-500">Upload Company Image</span>
            </div>
          </Upload>
          <p className="text-sm text-gray-500 mt-2">
            Please upload up to 5 high-quality images with recommended dimensions of 800x800 pixels.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {compImageUrls.map((url, index) => (
              <div key={index} className="relative">
                <img src={url} alt={`Company Image ${index}`} className="w-full h-auto rounded-lg" />
                <Button
                  type="link"
                  onClick={() => handleImageRemove(url)}
                  icon={<DeleteOutlined />}
                  className="absolute top-2 right-2 text-red-500"
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </Form.Item>

        {discovercompimg.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Preview Company Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {discovercompimg.map((image, index) => (
                <div key={image._id} className="relative">
                  <img src={image.imageUrl} alt={`Company ${index + 1}`} className="w-full h-auto rounded-lg" />
                  <Button
                    type="link"
                    onClick={() => handleImageRemove(image._id)}
                    icon={<DeleteOutlined />}
                    className="absolute top-2 right-2 text-red-500"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit">Save Changes</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AdminDiscover;
