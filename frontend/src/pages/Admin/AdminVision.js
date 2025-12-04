import React, { useState, useEffect, useCallback } from "react";
import { Modal, Form, Input, Button, message, List, Skeleton } from "antd";
import axios from "axios";

const { TextArea } = Input;

const AdminVision = () => {
  const [assessaData, setassessaData] = useState(null);
  const [modalData, setModalData] = useState({
    isVisible: false,
    type: "",
    data: null,
  });
  const [form] = Form.useForm();
  const [imgUrl, setImgUrl] = useState(""); // stores S3 key
  const [previewUrl, setPreviewUrl] = useState(""); // stores signed URL for preview
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchassessaData();
  }, []);

  // ✅ Upload file to backend (S3)
  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) {
      console.log("No file selected");
      return;
    }

    setUploading(true);

    // preview file locally
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(selectedFile);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("folder", "vision"); // store in S3/vision

      const res = await axios.post("/api/skillnaav/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setImgUrl(res.data.key); // S3 key for saving to DB
        setPreviewUrl(res.data.url); // Signed URL for preview
      } else {
        message.error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Fetch data from backend
  const fetchassessaData = useCallback(async () => {
    try {
      const response = await axios.get("/api/skillnaav/get-skillnaav-data");
      setassessaData(response.data);

      if (response.data.visionhead && response.data.visionhead.length > 0) {
        setImgUrl(response.data.visionhead[0].visionImgKey || "");
        setPreviewUrl(response.data.visionhead[0].visionImg || "");
      }
    } catch (error) {
      console.error("Error fetching skillnaav data:", error);
    }
  }, []);

  // ✅ Save changes
  const handleFinish = useCallback(
    async (values) => {
      try {
        let response;
        if (modalData.type === "editHead") {
          const { _id } = modalData.data;
          response = await axios.put(
            `/api/skillnaav/update-visionhead/${_id}`,
            {
              ...values,
              visionImg: imgUrl, // save S3 key, not URL
            }
          );
        } else if (modalData.type === "editPoint") {
          const { _id } = modalData.data;
          values._id = _id;
          response = await axios.put(
            `/api/skillnaav/update-visionpoint/${_id}`,
            values
          );
        } else if (modalData.type === "addPoint") {
          response = await axios.post("/api/skillnaav/add-visionpoint", values);
        }

        if (response.data.success) {
          message.success(response.data.message);
          setModalData({ isVisible: false, type: "", data: null });
          fetchassessaData();
          form.resetFields();
          setPreviewUrl("");
        } else {
          message.error(response.data.message);
        }
      } catch (error) {
        message.error(`Error ${modalData.type} vision data: ${error.message}`);
      }
    },
    [modalData, form, fetchassessaData, imgUrl]
  );

  const handleDelete = useCallback(
    async (visionpointId) => {
      try {
        const response = await axios.delete(
          `/api/skillnaav/delete-visionpoint/${visionpointId}`
        );
        if (response.data.success) {
          message.success(response.data.message);
          fetchassessaData();
        } else {
          message.error(response.data.message);
        }
      } catch (error) {
        message.error(`Error deleting vision point: ${error.message}`);
      }
    },
    [fetchassessaData]
  );

  const openModal = useCallback(
    (type, data = null) => {
      setModalData({ isVisible: true, type, data });
      if (data) {
        form.setFieldsValue(data);
        setImgUrl(data.visionImgKey || "");
        setPreviewUrl(data.visionImg || "");
      }
    },
    [form]
  );

  if (!assessaData) {
    return (
      <div className="flex justify-center items-center h-full">
        <Skeleton active avatar />
      </div>
    );
  }

  const { visionhead, visionpoint } = assessaData;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="border p-4 rounded-lg bg-white shadow-md">
          <h1 className="text-2xl font-semibold mb-4">Vision Head</h1>
          <div className="mb-4">
            <p className="text-lg mb-2 font-semibold">Heading:</p>
            <p className="mb-2">{visionhead[0]?.visionheading}</p>
          </div>
          <div className="mb-4">
            <p className="text-lg mb-2 font-semibold">Sub Heading:</p>
            <p className="mb-2">{visionhead[0]?.visionsub}</p>
          </div>
          {previewUrl && (
            <div className="mb-4">
              <p className="text-lg mb-2 font-semibold">Image:</p>
              <img
                src={previewUrl}
                alt="Vision"
                className="max-w-full h-auto rounded"
                style={{ maxHeight: "400px", objectFit: "cover" }}
              />
            </div>
          )}
          <div className="flex justify-end">
            <Button
              type="primary"
              onClick={() => openModal("editHead", visionhead[0])}
            >
              Edit Vision Head
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="border p-4 rounded-lg bg-white shadow-md">
          <h1 className="text-2xl font-semibold mb-4">Vision Points</h1>
          <List
            itemLayout="horizontal"
            dataSource={visionpoint}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    onClick={() => openModal("editPoint", item)}
                    className="text-blue-500"
                  >
                    Edit
                  </Button>,
                  <Button
                    type="link"
                    onClick={() => handleDelete(item._id)}
                    className="text-red-500"
                  >
                    Delete
                  </Button>,
                ]}
              >
                <List.Item.Meta title={item.visionpoint} />
              </List.Item>
            )}
          />
          <div className="flex justify-end mt-4">
            <Button
              type="primary"
              onClick={() => openModal("addPoint")}
              className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Add Vision Point
            </Button>
          </div>
        </div>
      </div>

      {/* Edit/Add Vision Modal */}
      <Modal
        visible={modalData.isVisible}
        title={
          modalData.type === "editHead"
            ? "Edit Vision Head"
            : modalData.type === "editPoint"
            ? "Edit Vision Point"
            : "Add Vision Point"
        }
        onCancel={() =>
          setModalData({ isVisible: false, type: "", data: null })
        }
        footer={null}
      >
        <Form layout="vertical" onFinish={handleFinish} form={form}>
          {modalData.type === "editHead" ? (
            <>
              <Form.Item
                name="visionheading"
                label="Vision Heading"
                rules={[
                  { required: true, message: "Please enter vision heading" },
                ]}
              >
                <TextArea rows={4} />
              </Form.Item>
              <Form.Item
                name="visionsub"
                label="Vision Sub Heading"
                rules={[
                  {
                    required: true,
                    message: "Please enter vision sub heading",
                  },
                ]}
              >
                <TextArea rows={4} />
              </Form.Item>
              <Form.Item
                name="visionImg"
                label="Vision Image"
                rules={[
                  { required: true, message: "Please upload vision image" },
                ]}
              >
                <input type="file" onChange={handleFileUpload} />
                {uploading ? (
                  <div className="mt-2 flex items-center">
                    <Skeleton.Avatar active size="small" />
                    <Skeleton.Button
                      active
                      style={{ marginLeft: 10, width: 150 }}
                    />
                  </div>
                ) : previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Vision"
                    className="max-w-full h-auto rounded mt-2"
                    style={{ maxHeight: "200px", objectFit: "cover" }}
                  />
                ) : null}
              </Form.Item>
            </>
          ) : (
            <Form.Item
              name="visionpoint"
              label="Vision Point"
              rules={[{ required: true, message: "Please enter vision point" }]}
            >
              <TextArea rows={4} />
            </Form.Item>
          )}
          <div className="flex justify-end">
            <Button type="primary" htmlType="submit">
              {modalData.type === "addPoint" ? "Add" : "Save"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default React.memo(AdminVision);
